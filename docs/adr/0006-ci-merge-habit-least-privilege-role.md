# 0006. CI logs merges through a one-INSERT Postgres role

Date: 2026-09-09

## Context

Every merged PR should be logged as a `Working on apps` habit from a GitHub Actions workflow.
The obvious credential, the service role key, bypasses RLS on every table; a leak from CI would
expose the whole database.

## Decision

Migration `20260612000001_ci_inserter_role.sql` creates the Postgres role `ci_inserter`
(`NOLOGIN NOINHERIT`) with exactly `INSERT` on `public.habit`, `USAGE, SELECT` on
`habit_id_seq` and column-level `SELECT (id, name)` on `public.action`, plus an RLS policy that
allows its inserts. The workflow `.github/workflows/log-merge-habit.yml` connects with `psql`
as that role.

## Consequences

- Blast radius of a leaked credential is one INSERT on one table.
- The role must be activated per environment by hand
  (`ALTER ROLE ci_inserter LOGIN PASSWORD '...'`); the migration deliberately does not set a
  password.
- The secret `CI_INSERTER_DB_URL` must use the session pooler on port 5432: GitHub runners are
  IPv4-only and the transaction pooler (6543) does not suit `psql` sessions.
- Setup steps: [README](../../README.md#post-merge-automation).
