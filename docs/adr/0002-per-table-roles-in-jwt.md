# Per-table roles stamped into the JWT, enforced by RLS

Authorization is a `user_roles(user_id, table_name, role)` table with roles
`viewer | manager | admin`; a custom access-token hook copies them into the JWT
so RLS can read them without a join. `table_name = '_global'` with role
`admin` overrides everything. Enforcement is the SQL helper
`is_manager_of(table)` inside RLS policies; the client hook
`useCanManage(table)` only hides write UI and is never the security boundary.
Self-signup is disabled in every environment (local/CI via `config.toml`,
production manually in the dashboard); accounts are created by an admin.

Considered options: a single global role (too coarse once apps have different
owners), row-level ownership (no multi-user apps exist to justify it).
