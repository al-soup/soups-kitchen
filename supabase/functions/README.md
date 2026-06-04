# Supabase Edge Functions

## strava-activity

Nightly cron-triggered function that fetches recent Strava activities and saves it into the `strava_rides` DB table. A DB trigger will also create a corresponding entry in the `habit` DB table.

### Why a DB table for tokens?

Strava uses OAuth2 with short-lived access tokens (6h) and **rotating refresh
tokens** — every token refresh returns a new refresh token and invalidates the
old one. Since Supabase secrets are read-only from edge functions, we can't
update them at runtime. A `strava_tokens` DB table lets the function
self-maintain its credentials after each refresh.

### Auth flow

```text
┌─────────────────────────────────────────────────────────┐
│  ONE-TIME SETUP (scripts/strava-auth.mjs)               │
│                                                         │
│  1. Open browser → Strava OAuth consent screen          │
│  2. User authorizes → redirect to localhost:8089        │
│  3. Script exchanges auth code for tokens via           │
│     POST https://www.strava.com/oauth/token             │
│  4. Calls upsert_strava_tokens RPC with the plaintext   │
│     tokens + STRAVA_TOKEN_KEY; pgcrypto encrypts on     │
│     write into strava_tokens.{access,refresh}_token_enc │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  DAILY CRON (strava-activity edge function)             │
│                                                         │
│  0. Validate x-cron-secret (timing-safe compare)        │
│  1. RPC get_strava_token(p_key=STRAVA_TOKEN_KEY)        │
│     → returns decrypted access_token, refresh_token,    │
│       expires_at                                        │
│  2. Check expires_at — if expired:                      │
│     a. POST refresh_token to Strava token endpoint      │
│     b. Receive new access_token + refresh_token         │
│     c. RPC update_strava_access_token(... p_key)        │
│        → re-encrypts and persists                       │
│  3. GET /api/v3/athlete/activities?per_page=20          │
│  4. Filter to ride sport_types, convert units           │
│  5. Upsert into strava_rides (idempotent on             │
│     strava_activity_id)                                 │
│  6. Return { fetched, kept, inserted, skipped }         │
└─────────────────────────────────────────────────────────┘
```

[Strava Auth Docs](https://developers.strava.com/docs/authentication/)

[Manage your Strava API settings](https://www.strava.com/settings/api)

### Token lifecycle

| Token           | Lifetime   | Storage                                            | Rotation                        |
| --------------- | ---------- | -------------------------------------------------- | ------------------------------- |
| `access_token`  | 6 hours    | `strava_tokens.access_token_enc` (pgp_sym, bytea)  | Replaced on every refresh       |
| `refresh_token` | Until used | `strava_tokens.refresh_token_enc` (pgp_sym, bytea) | New one issued on every refresh |

Both tokens are updated atomically by `update_strava_access_token` after each
refresh. The old refresh token is immediately invalid — there is no grace
period.

### Encryption at rest

Token columns are `bytea` ciphertext produced by `pgp_sym_encrypt(plaintext, key)`
(pgcrypto). The key (`STRAVA_TOKEN_KEY`, 32+ chars) lives only in env vars —
never in the DB. Three `SECURITY DEFINER` RPCs gate access:

| RPC                          | Caller                    | What it does                                    |
| ---------------------------- | ------------------------- | ----------------------------------------------- |
| `upsert_strava_tokens`       | `scripts/strava-auth.mjs` | Wipes prior row, encrypts both tokens, inserts. |
| `get_strava_token`           | `strava-activity` edge fn | Returns the single row decrypted in-place.      |
| `update_strava_access_token` | `strava-activity` edge fn | Re-encrypts both tokens + bumps expiry.         |

All three are `REVOKE`d from `anon`/`authenticated` and `GRANT`ed only to
`service_role`. A DB breach without the key yields ciphertext only.

Hint: Create a new key with `openssl rand -base64 48 | pbcopy`

### Database

`strava_tokens` table (service_role access only, RLS enabled with no policies).
Reads/writes go through the encryption RPCs above — direct selects return
ciphertext.

| Column              | Type        | Notes                                 |
| ------------------- | ----------- | ------------------------------------- |
| `id`                | int (PK)    | Auto-generated                        |
| `athlete_id`        | bigint      | Strava athlete ID                     |
| `access_token_enc`  | bytea       | `pgp_sym_encrypt(access_token, key)`  |
| `refresh_token_enc` | bytea       | `pgp_sym_encrypt(refresh_token, key)` |
| `expires_at`        | bigint      | Unix epoch seconds                    |
| `created_at`        | timestamptz | Row creation time                     |
| `updated_at`        | timestamptz | Last token refresh time               |

`strava_rides` table (service_role access only, RLS enabled with no policies).
Filtered to ride sport types: `Ride`, `VirtualRide`, `GravelRide`,
`MountainBikeRide`. Idempotent on `strava_activity_id`:

| Column               | Type           | Notes                          |
| -------------------- | -------------- | ------------------------------ |
| `id`                 | bigserial (PK) | Auto-generated                 |
| `strava_activity_id` | bigint UNIQUE  | Strava activity ID             |
| `ride_date`          | timestamptz    | `start_date` from Strava (UTC) |
| `distance_km`        | numeric(7,2)   | Converted from meters          |
| `elevation_gain_m`   | numeric(7,1)   | `total_elevation_gain`         |
| `average_speed_kmh`  | numeric(5,2)   | Converted from m/s             |
| `raw_response`       | jsonb          | Full Strava activity object    |
| `created_at`         | timestamptz    | Row creation time              |

### Secrets

| Secret                      | Where                                 | Used by                                                        |
| --------------------------- | ------------------------------------- | -------------------------------------------------------------- |
| `STRAVA_CLIENT_ID`          | Supabase secrets (prod), .env (local) | Edge function + setup script                                   |
| `STRAVA_CLIENT_SECRET`      | Supabase secrets (prod), .env (local) | Edge function + setup script                                   |
| `CRON_SECRET`               | Supabase secrets (prod), .env (local) | Edge function (auth guard)                                     |
| `STRAVA_TOKEN_KEY`          | Supabase secrets (prod), .env (local) | Edge function + setup script (pgcrypto at-rest key, 32+ chars) |
| `SUPABASE_URL`              | Auto-available in edge functions      | Edge function                                                  |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-available in edge functions      | Edge function                                                  |

### Setup

```sh
# 1. Set Strava + encryption secrets (production)
supabase secrets set \
  STRAVA_CLIENT_ID=<id> \
  STRAVA_CLIENT_SECRET=<secret> \
  CRON_SECRET=<secret> \
  STRAVA_TOKEN_KEY=<32+-char passphrase>

# 2. Run migrations (the encrypt_strava_tokens migration truncates the
#    existing row — re-auth required in step 4).
pnpm supabase:reset   # local
# or push to remote

# 3. Add STRAVA_TOKEN_KEY to .env.local (same value as the Supabase secret)
#    so `pnpm strava:auth` can call the encrypting RPC.

# 4. One-time OAuth authorization
pnpm strava:auth

# 5. Schedule cron in Supabase Dashboard (daily, e.g. 06:00 UTC)
#    Set x-cron-secret header in the cron config to match CRON_SECRET
```

### Local testing

```sh
# Start local Supabase
pnpm supabase:start

# Serve Edge functions
supabase functions serve --env-file .env.local

export CRON_SECRET="<your-secret>"

# Invoke function (POST, requires x-cron-secret header)
# use `-o <file-name>` to save the response body
curl -i -X POST http://127.0.0.1:54221/functions/v1/strava-activity \
  -H "Content-Type: application/json" \
  -H "x-cron-secret: $CRON_SECRET" \
  -d '{}'
```

### Promoting to production

Supabase recommends a **local-first** workflow: migrations are the
source of truth, edge functions are versioned in code, never edit prod
schema via Studio.

```sh
# 1. Capture any remote-only schema as a tracked migration (run if remote
#    has drift from local migrations).
supabase db pull

# 2. Apply local migrations to remote.
supabase db push

# 3. Deploy the edge function.
supabase functions deploy strava-activity

# 4. Set production secrets (includes STRAVA_TOKEN_KEY — 32+ char passphrase
#    used by pgcrypto to encrypt/decrypt tokens at rest).
supabase secrets set \
  STRAVA_CLIENT_ID=<id> \
  STRAVA_CLIENT_SECRET=<secret> \
  CRON_SECRET=<secret> \
  STRAVA_TOKEN_KEY=<32+-char passphrase>

# 5. Run one-time OAuth (point pnpm strava:auth at the prod env).
# To load the prod credentials replace the env file in the `loadEnvFile` function.
pnpm strava:auth

# 6. Schedule the cron in Dashboard -> Integrations -> Cron
# It currently runs at 02:30 AM.

# 7. Smoke test against prod.
curl -i -X POST https://<project>.supabase.co/functions/v1/strava-activity \
  -H "Content-Type: application/json" \
  -H "x-cron-secret: $CRON_SECRET" \
  -d '{}'
```
