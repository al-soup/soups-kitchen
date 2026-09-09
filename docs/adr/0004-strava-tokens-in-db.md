# 0004. Strava tokens live encrypted in a table, not in secrets

Date: 2026-09-09

## Context

The daily `strava-activity` edge function needs a Strava access token. Strava access tokens
expire after six hours and every refresh returns a new refresh token that invalidates the old
one. Supabase secrets are read-only from edge functions, so the function cannot store the rotated
token where it came from.

## Decision

Tokens live in the `strava_tokens` table, encrypted at rest with pgcrypto under the passphrase
`STRAVA_TOKEN_KEY`, which is the only Strava credential kept as a Supabase secret. The function
reads and rewrites tokens through RPCs that encrypt and decrypt server-side.

## Consequences

- The function self-maintains its credentials; a one-time OAuth run (`pnpm strava:auth`) seeds
  the row per environment.
- Losing or rotating `STRAVA_TOKEN_KEY` invalidates the stored tokens and requires re-auth.
- Auth flow, token lifecycle, secrets and promotion steps are documented in
  [`supabase/functions/README.md`](../../supabase/functions/README.md#strava-activity).
