# 0011. Merge to main deploys schema and functions before the app

Date: 2026-09-10

## Context

Migrations and edge functions were pushed to prod from a laptop; the app deployed itself through
Vercel's git integration the moment `main` moved. Two separate paths, no ordering: new code could
run against the old schema, or a migration could fail after the app was already live.

## Decision

Vercel auto-deploy for `main` is off (`vercel.json`, `git.deploymentEnabled.main = false`).
`.github/workflows/deploy.yml` runs on push to `main`, after the CI job: `supabase link`,
`supabase db push`, `supabase functions deploy`, then a POST to a Vercel deploy hook. Secrets
live in the GitHub `Production` environment, restricted to `main`. The token is a full-access
Supabase personal access token; the DB is reached through a temporary login role, no DB
password.

## Consequences

- A failed migration stops the run before the app deploys: old app + old schema, consistent.
  Fix forward; there is no automatic rollback.
- The access token can do anything to the account. Containment is the environment's branch
  restriction and a 1-year expiry. Fine-grained tokens do not yet cover the CLI's endpoints
  (README, "Access token"); revisit when they do.
- The `migrations` PR job (ADR-0010) is now the last check before prod, so it is a required
  status check and branches must be up to date before merge.
- Preview deploys for PR branches still come from Vercel's git integration.
- `ci.yml` no longer runs on push to `main`; `deploy.yml` calls it instead.
