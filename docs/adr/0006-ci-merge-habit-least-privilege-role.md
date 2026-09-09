# CI logs merges through a one-INSERT Postgres role

Every merged PR is logged as a `Working on apps` habit by
`.github/workflows/log-merge-habit.yml`. Instead of handing CI the service
role key (full RLS bypass), a dedicated Postgres role `ci_inserter`
(`NOLOGIN NOINHERIT`, migration `20260612000001_ci_inserter_role.sql`) gets
exactly `INSERT` on `public.habit`, sequence usage, and column-level `SELECT`
on `action(id, name)`; a matching RLS policy allows the insert. Blast radius
of a leaked credential is one INSERT on one table.

Consequences: the role must be activated per environment by hand
(`ALTER ROLE ci_inserter LOGIN PASSWORD '...'`), and the connection string must
use the session pooler on port 5432 because GitHub runners are IPv4-only.
Setup in [README](../../README.md#post-merge-automation).
