# Strava tokens live encrypted in a table, not in secrets

Strava rotates the refresh token on every refresh and Supabase secrets are
read-only from edge functions, so the daily sync cannot keep its credentials
in secrets. Tokens are stored in `strava_tokens`, encrypted at rest with
pgcrypto under a passphrase that _is_ a secret (`STRAVA_TOKEN_KEY`); the
function reads and rewrites them through RPCs. Mechanics, auth flow and
setup: [`supabase/functions/README.md`](../../supabase/functions/README.md).
