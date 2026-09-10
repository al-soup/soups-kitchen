# 0010. CI applies new migrations on a seeded base schema

Date: 2026-09-10

## Context

Migrations used to be applied to prod from a developer machine. Prod is never rebuilt: it holds
data and receives only the migration files that are new since the last deploy. The e2e job
boots Supabase from an empty database and runs the seed only after every migration, so a
migration that fails on populated tables (a `NOT NULL` column without default, a type change,
a new unique constraint) passes e2e and breaks on prod.

## Decision

A separate PR job replays the prod path: check out the base branch's `supabase/migrations` and
`seed.sql`, `supabase start` (base schema + seeded data), restore the PR's files, then
`supabase migration up --local`. Afterwards it regenerates `database.types.ts` and fails on a
diff. The e2e job keeps booting from scratch and is not changed.

## Consequences

- Two Supabase boots per PR, in parallel. Accepted for clearer failure signals; folding the
  replay into e2e would run e2e against the base seed, so a PR that adds seed rows for a new
  table would fail.
- `migration up` rejects a file that sorts before the last applied one, which turns the
  "new migration timestamp must sort last" rule into a CI check.
- Prod data differs from the seed. The check catches shape problems, not every data problem.
- Deploying to prod is still manual. Automating `supabase db push` on merge is a separate
  decision.
