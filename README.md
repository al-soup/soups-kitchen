# Soup's Kitchen

Multi-app platform hosting small tools and my portfolio.

## What's inside

- **Habits** — habit tracker, infinite-scroll feed, score graph, daily Strava sync
- **Fahrplan** — Swiss departure board (search.ch)
- **Knowledge Base** — markdown notes, tag filters, full-text search (typo-tolerant)
- **Fragespiel** — risograph swipe deck of philosophical questions (DE/EN, mobile-first)
- **Resources** — file uploads on Supabase Storage, reusable across apps
- **About** — portfolio (experience + me)

## Tech stack

- Next.js 16 (app router, `proxy.ts` not `middleware.ts`)
- React 19 + TypeScript 5
- Supabase (auth, Postgres w/ RLS, Storage, Edge Functions)
- CSS Modules + theme CSS vars (light / dark / neo-brutalist)
- pnpm 11.5 (pinned via `packageManager`)
- Jest (unit) + Playwright (e2e, chromium)

## Development

```bash
pnpm install
pnpm dev
```

### Local Supabase

Requires Docker Desktop. Ports are offset from Supabase defaults (API: 54221, DB: 54222,
Studio: 54223) to allow running alongside other local Supabase projects.

```bash
pnpm supabase:start   # boot local instance
pnpm supabase:reset   # wipe + rerun migrations & seed
```

Seed users: `admin@local.test`, `manager@local.test`, `viewer@local.test` (pw: `password123`).

## Environment variables

See `.env.example`.

Required for dev:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Optional (Strava sync, prod only):

- `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `STRAVA_TOKEN_KEY`, `CRON_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`

`.env.test` is wired to local Supabase and used by Playwright auto-launch.

## Scripts

| Command                    | Description                                       |
| -------------------------- | ------------------------------------------------- |
| `pnpm dev`                 | Dev server (local Supabase)                       |
| `pnpm dev:remote`          | Dev server (remote Supabase via `.env.remote`)    |
| `pnpm build`               | Production build                                  |
| `pnpm start`               | Run production build                              |
| `pnpm lint`                | ESLint fix                                        |
| `pnpm lint:check`          | ESLint check (for CI)                             |
| `pnpm format`              | Prettier fix                                      |
| `pnpm format:check`        | Prettier check (for CI)                           |
| `pnpm test`                | Run unit tests                                    |
| `pnpm test:e2e`            | Run Playwright tests (auto-starts Supabase)       |
| `pnpm test:e2e:ui`         | Playwright UI mode                                |
| `pnpm supabase:start`      | Start local Supabase                              |
| `pnpm supabase:stop`       | Stop local Supabase                               |
| `pnpm supabase:reset`      | Reset DB + rerun migrations & seed + dev uploads  |
| `pnpm supabase:types`      | Regenerate `database.types.ts`                    |
| `pnpm seed:resources`      | Upload `supabase/seed-files/*` to Storage         |
| `pnpm generate-icons`      | Regenerate per-app PWA icons                      |
| `pnpm generate-tech-logos` | Regenerate tech-stack tag PNGs in `public/tech/`  |
| `pnpm strava:auth`         | One-time Strava OAuth setup (stores tokens in DB) |

## Knowledge Base MCP

Remote [MCP](https://modelcontextprotocol.io) server hosted as Supabase edge
function `kb-mcp` (Streamable HTTP, stateless). Lets an agentic coding tool
create KB entries from any machine, nothing runs locally. Gated by a static
bearer token; DB access via service role. Tools: `kb_list_tags`, `kb_search`,
`kb_create_entry`. Setup, secrets and local testing in
[`supabase/functions/README.md`](supabase/functions/README.md#kb-mcp).

Register once per machine (user scope):

```sh
claude mcp add --transport http --scope user soups-kitchen-kb \
  https://<project-ref>.supabase.co/functions/v1/kb-mcp \
  --header "Authorization: Bearer <KB_MCP_TOKEN>"
```

## Auth model

- Public reads: Knowledge Base (list, detail, resource signed URLs)
- Auth required (proxy redirect to `/login`): `/resources`, `/apps/habits/create`, `/apps/habits/[id]`
- Signup disabled (`enable_signup = false` in `config.toml` + `config.ci.toml`; set the same in the
  prod dashboard by hand). Min password 8 chars w/ letters + digits. Accounts created by an admin only
- Manager / admin: writes on KB, tags, resources — gated by RLS via `is_manager_of(table)`
- Rationale: [ADR-0002](docs/adr/0002-per-table-roles-in-jwt.md),
  [ADR-0003](docs/adr/0003-public-read-rls-with-proxy-gate.md)

## Testing

- `pnpm test` — Jest, jsdom, colocated `*.test.ts(x)`
- `pnpm test:e2e` — Playwright, chromium, auto-boots local Supabase from `config.ci.toml`
- CI: unit + format + lint on push; PR adds e2e

## Post-merge automation

`.github/workflows/log-merge-habit.yml` logs every merged PR as a `Working on apps` habit
(note = `Soup's Kitchen: <PR title>`, PR url, merge commit message). It connects as the
least-privilege Postgres role `ci_inserter` ([ADR-0006](docs/adr/0006-ci-merge-habit-least-privilege-role.md)).

Per environment, once, in the Supabase SQL editor:

```sql
ALTER ROLE ci_inserter LOGIN PASSWORD '<long-random>';
```

GitHub secret `CI_INSERTER_DB_URL` = session-pooler URL (port 5432, not 6543; runners are IPv4-only):

```text
postgres://ci_inserter.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres
```

## Documentation

- [CONTEXT.md](CONTEXT.md) — domain glossary
- [docs/adr/](docs/adr/README.md) — architecture decisions
- [supabase/functions/README.md](supabase/functions/README.md) — edge functions (Strava sync, KB MCP)

## PWA Support

All apps under _/apps_ are installable as PWAs (Android "Add to Home Screen", iOS home screen icon). Each app has its own web app manifest and icons. Run `pnpm generate-icons` to regenerate icons from `public/soup.svg`.

## TODO

Tracked in [GitHub Issues](https://github.com/al-soup/soups-kitchen/issues).
