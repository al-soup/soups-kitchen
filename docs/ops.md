# Production operations

One-time setup and secrets for the GitHub → Supabase → Vercel pipeline. Decisions behind it:
[ADR-0006](./adr/0006-ci-merge-habit-least-privilege-role.md),
[ADR-0010](./adr/0010-ci-migrations-replay-prod-path.md),
[ADR-0011](./adr/0011-cd-migrations-before-app-deploy.md),
[ADR-0014](./adr/0014-pnpm-workspace-monorepo.md).

## Deploy pipeline

`.github/workflows/deploy.yml` on push to `main`: CI job, `supabase link`, `db push`,
`functions deploy`, then a POST to the Vercel deploy hook. Vercel auto-deploy for `main` is off
(`apps/web/vercel.json`); PR previews are unaffected.

Vercel → Project → Settings → Build & Deployment, set by hand, not in source:

- Root Directory = `apps/web`, with "Include files outside the Root Directory" on (the lockfile
  and `pnpm-workspace.yaml` sit at the repo root).
- No build, install or output overrides.

Vercel reads `vercel.json` from the Root Directory only. Move one without the other and `main`
auto-deploys again, next to the deploy hook, and the ordering from ADR-0011 is gone.

Secrets live in the GitHub `Production` environment, restricted to `main` (never repo-level):

| Secret                   | Value                                                           |
| ------------------------ | --------------------------------------------------------------- |
| `SUPABASE_ACCESS_TOKEN`  | Supabase personal access token, see below                       |
| `VERCEL_DEPLOY_HOOK_URL` | Vercel → Project → Settings → Git → Deploy Hooks, branch `main` |

Plus one environment **variable** (not secret) `SUPABASE_PROJECT_REF` = the Supabase project
ref, kept out of source by preference: `gh variable set SUPABASE_PROJECT_REF --env Production`.

No DB password: the CLI mints a temporary login role through the Management API
(`POST /v1/projects/{ref}/cli/login-role`) and steps up to `postgres` for DDL. If a push ever fails
on privileges, add `SUPABASE_DB_PASSWORD` to the environment; it takes precedence.

```bash
gh auth switch --user al-soup
gh secret set SUPABASE_ACCESS_TOKEN --env Production -R al-soup/soups-kitchen
gh secret set VERCEL_DEPLOY_HOOK_URL --env Production -R al-soup/soups-kitchen
gh secret list --env Production -R al-soup/soups-kitchen
```

## Access token

Dashboard → Account → Access Tokens → **full-access** token named `github-actions-deploy`, with
an expiry and a calendar reminder. Rotation = generate a new one, then one `gh secret set`.

Why not fine-grained: the fine-grained grid (preview, Sept 2026) covers Project, Database,
Infrastructure and Account only. The CLI also needs `api_gateway_keys_read` (`link` fetches API
keys, hard failure) and `edge_functions_write` (`functions deploy`), which have no row. Switch to
fine-grained once those rows exist; the grid would then be:

| Section        | Row                | Level | Used by                                    |
| -------------- | ------------------ | ----- | ------------------------------------------ |
| Project        | Project Settings   | Read  | `link` — `GET /v1/projects/{ref}`          |
| API            | API Keys           | Read  | `link` — `GET .../api-keys`                |
| Database       | Database           | Write | `db push` — mint login role                |
| Database       | Connection Pooling | Read  | `link` — pooler URL; runners are IPv4-only |
| Edge Functions | Edge Functions     | Write | `functions deploy` — list + deploy         |

Everything else None, incl. Database → Migrations (history table is written over SQL) and
Database JIT. Derived from `x-fga-permissions` in the Management API spec
(`https://api.supabase.com/api/v1-json`); a 403 names the endpoint to look up.

## Post-merge automation

`.github/workflows/log-merge-habit.yml` logs every merged PR as a `Working on apps` habit
(note = `Soup's Kitchen: <PR title>`, PR url, merge commit message). It connects as the
least-privilege Postgres role `ci_inserter`.

Per environment, once, in the Supabase SQL editor:

```sql
ALTER ROLE ci_inserter LOGIN PASSWORD '<long-random>';
```

GitHub secret `CI_INSERTER_DB_URL` = session-pooler URL (port 5432, not 6543; runners are IPv4-only):

```text
postgres://ci_inserter.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres
```
