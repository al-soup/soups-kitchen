# Supabase Edge Functions

## strava-activity

Daily cron-triggered function that fetches recent Strava activities.

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
│  4. Stores access_token, refresh_token, expires_at      │
│     in strava_tokens table via Supabase service_role    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  DAILY CRON (strava-activity edge function)             │
│                                                         │
│  0. Validate x-cron-secret header (reject if missing)   │
│  1. Read token row from strava_tokens                   │
│  2. Check expires_at — if expired:                      │
│     a. POST refresh_token to Strava token endpoint      │
│     b. Receive new access_token + refresh_token         │
│     c. Update strava_tokens row                         │
│  3. GET /api/v3/athlete/activities?after=<24h ago>      │
│  4. Return activities as JSON                           │
└─────────────────────────────────────────────────────────┘
```

### Token lifecycle

| Token           | Lifetime   | Storage            | Rotation                        |
| --------------- | ---------- | ------------------ | ------------------------------- |
| `access_token`  | 6 hours    | `strava_tokens` DB | Replaced on every refresh       |
| `refresh_token` | Until used | `strava_tokens` DB | New one issued on every refresh |

Both tokens are updated atomically in the same DB upsert after each refresh.
The old refresh token is immediately invalid — there is no grace period.

### Database

`strava_tokens` table (service_role access only, RLS enabled with no policies):

| Column          | Type        | Notes                            |
| --------------- | ----------- | -------------------------------- |
| `id`            | int (PK)    | Auto-generated                   |
| `athlete_id`    | bigint      | Strava athlete ID                |
| `access_token`  | text        | Current valid token              |
| `refresh_token` | text        | Used to obtain next access token |
| `expires_at`    | bigint      | Unix epoch seconds               |
| `created_at`    | timestamptz | Row creation time                |
| `updated_at`    | timestamptz | Last token refresh time          |

### Secrets

| Secret                      | Where                                 | Used by                      |
| --------------------------- | ------------------------------------- | ---------------------------- |
| `STRAVA_CLIENT_ID`          | Supabase secrets (prod), .env (local) | Edge function + setup script |
| `STRAVA_CLIENT_SECRET`      | Supabase secrets (prod), .env (local) | Edge function + setup script |
| `CRON_SECRET`               | Supabase secrets (prod), .env (local) | Edge function (auth guard)   |
| `SUPABASE_URL`              | Auto-available in edge functions      | Edge function                |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-available in edge functions      | Edge function                |

### Setup

```sh
# 1. Set Strava secrets (production)
supabase secrets set STRAVA_CLIENT_ID=<id> STRAVA_CLIENT_SECRET=<secret> CRON_SECRET=<secret>

# 2. Run migrations
pnpm supabase:reset   # local
# or push to remote

# 3. One-time OAuth authorization
pnpm strava:auth

# 4. Schedule cron in Supabase Dashboard (daily, e.g. 06:00 UTC)
#    Set x-cron-secret header in the cron config to match CRON_SECRET
```

### Local testing

```sh
# Start local Supabase
pnpm supabase:start

# Serve Edge functions
supabase functions serve --env-file .env.local

# Invoke function (requires x-cron-secret header)
curl -i http://127.0.0.1:54221/functions/v1/strava-activity \
  -H "x-cron-secret: $CRON_SECRET"
```

### Future work

- Map specific Strava activity types to habit entries
- Activity deduplication
- Multi-user support
