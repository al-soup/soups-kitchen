# 0002. Per-table roles stamped into the JWT, enforced by RLS

Date: 2026-09-09

## Context

Apps have different owners and audiences: the Knowledge Base is public, habits are personal,
resources are shared infrastructure. A single global role is too coarse; per-row ownership is
more than any app needs. Whatever the model, it must be enforced for writers that bypass the UI.

## Decision

Authorization is the table `user_roles(user_id, table_name, role)` with roles
`viewer | manager | admin`. A custom access-token hook copies the rows into the JWT so RLS can
read them without a join. `table_name = '_global'` with role `admin` overrides everything.
Enforcement is the SQL helper `is_manager_of(table)` inside RLS write policies. Self-signup is
disabled everywhere; accounts are created by an admin.

## Consequences

- The client hook `useCanManage(table)` only hides write UI. It is never the security boundary;
  a hidden button is not a permission.
- A role change takes effect on the next token refresh, not immediately.
- `enable_signup = false` lives in `config.toml` / `config.ci.toml` for local and CI; production
  must be set by hand in the dashboard and can drift.
- Adding an app with writes means adding a `table_name` value and an `is_manager_of` policy, not
  new code paths.
