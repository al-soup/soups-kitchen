# Soup's Kitchen

Multi-app platform hosting small personal tools and my portfolio.

## What's inside

- **Habits** — habit tracker, infinite-scroll feed, score graph (per type or combined),
  action filter + sort, insights (streaks, weekly/weekday charts, top actions), daily Strava sync
- **Fahrplan** — Swiss departure board (search.ch)
- **Knowledge Base** — markdown notes, tag filters, full-text search (typo-tolerant)
- **Fragespiel** — risograph swipe deck of philosophical questions (DE/EN, mobile-first)
- **Resources** — file uploads on Supabase Storage, reusable across apps (`/tools/resources`)
- **About** — portfolio (`/about/me` CV, `/about/experience` coming soon)

Each app under `/apps` is installable as a PWA. Domain vocabulary: [CONTEXT.md](CONTEXT.md).

## Tech stack

- Next.js 16 (app router, `proxy.ts` not `middleware.ts`), React 19, TypeScript 5
- Supabase (auth, Postgres w/ RLS, Storage, Edge Functions)
- CSS Modules + theme CSS vars (dark default / light)
- pnpm 11.5 (pinned via `packageManager`), Jest (unit), Playwright (e2e, chromium)

## Getting started

Requires Docker Desktop. Supabase ports are offset from the defaults (API: 54221, DB: 54222,
Studio: 54223) to allow running alongside other local projects.

```bash
cp .env.test .env.local   # wired to local Supabase
pnpm install
pnpm supabase:start
pnpm supabase:reset       # migrations + seed users + dev uploads
pnpm dev
```

Seed users: `admin@local.test`, `manager@local.test`, `viewer@local.test` (pw: `password123`).

Against the remote project instead: put its URL and publishable key in `.env.remote` and run
`pnpm dev:remote`. All variables, incl. the optional Strava and MCP ones: `.env.example`.

## Scripts

| Command                    | Description                                       |
| -------------------------- | ------------------------------------------------- |
| `pnpm dev` / `dev:remote`  | Dev server (local Supabase / `.env.remote`)       |
| `pnpm build` / `start`     | Production build / serve it                       |
| `pnpm lint` / `format`     | ESLint fix / Prettier fix (`:check` variants: CI) |
| `pnpm test`                | Unit tests                                        |
| `pnpm test:e2e` / `:ui`    | Playwright (auto-starts Supabase) / UI mode       |
| `pnpm supabase:start/stop` | Local Supabase                                    |
| `pnpm supabase:reset`      | Reset DB + rerun migrations & seed + dev uploads  |
| `pnpm supabase:types`      | Regenerate `database.types.ts`                    |
| `pnpm seed:resources`      | Upload `supabase/seed-files/*` to Storage         |
| `pnpm generate-icons`      | Regenerate per-app PWA icons                      |
| `pnpm generate-tech-logos` | Regenerate tech-stack tag PNGs in `public/tech/`  |
| `pnpm strava:auth`         | One-time Strava OAuth setup (stores tokens in DB) |

## Testing & CI

- Unit: Jest, jsdom, colocated `*.test.ts(x)`
- E2e: Playwright, chromium, boots local Supabase from `config.ci.toml`
- CI on push: build, format, lint, unit. PRs add e2e and a migrations job that replays only the
  PR's new migration files on a seeded base schema and checks `database.types.ts` is in sync
  ([ADR-0010](docs/adr/0010-ci-migrations-replay-prod-path.md))
- Push to `main` deploys schema, functions, then the app ([ADR-0011](docs/adr/0011-cd-migrations-before-app-deploy.md));
  every merged PR is logged as a habit ([ADR-0006](docs/adr/0006-ci-merge-habit-least-privilege-role.md)).
  Secrets and one-time setup: [docs/ops.md](docs/ops.md)

## Auth model

- Public reads: Knowledge Base (list, detail, resource signed URLs)
- Auth required (proxy redirect to `/login`): `/tools/resources`, `/apps/habits/create`,
  `/apps/habits/insights`, `/apps/habits/[id]`
- Signup disabled (`enable_signup = false` in `config.toml` + `config.ci.toml`; set the same in the
  prod dashboard by hand). Min password 8 chars w/ letters + digits. Accounts created by an admin only
- Manager / admin: writes on KB, tags, resources — gated by RLS via `is_manager_of(table)`
- Rationale: [ADR-0002](docs/adr/0002-per-table-roles-in-jwt.md),
  [ADR-0003](docs/adr/0003-public-read-rls-with-proxy-gate.md)

## Adding an app

1. Create `src/app/apps/<slug>/` with a `layout.tsx` that renders `AppFrame` and a
   `manifest.webmanifest/route.ts` calling `appManifestResponse("<slug>")` (copy an existing app).
2. Register it in `src/constants/apps.ts` — menus, `/apps` index, top bar icon and manifest follow.
3. Add its glyph to `scripts/generate-icons.mjs` and run `pnpm generate-icons`.
4. Gate routes in `src/lib/protectedRoutes.ts` if needed; manifests stay public automatically.

Conventions and rules for agents: [CLAUDE.md](CLAUDE.md). Design decisions:
[ADR-0012](docs/adr/0012-mono-shell-apps-keep-typography.md).

## Knowledge Base MCP

Remote [MCP](https://modelcontextprotocol.io) server hosted as Supabase edge function `kb-mcp`
(Streamable HTTP, stateless). Lets an agentic coding tool create KB entries from any machine.
Tools: `kb_list_tags`, `kb_search`, `kb_create_entry`. Setup, secrets and local testing:
[`supabase/functions/README.md`](supabase/functions/README.md#kb-mcp).

Register once per machine (user scope):

```sh
claude mcp add --transport http --scope user soups-kitchen-kb \
  https://<project-ref>.supabase.co/functions/v1/kb-mcp \
  --header "Authorization: Bearer <KB_MCP_TOKEN>"
```

## Documentation

- [CONTEXT.md](CONTEXT.md) — domain glossary
- [docs/adr/](docs/adr/README.md) — architecture decisions
- [docs/ops.md](docs/ops.md) — production secrets and one-time setup
- [supabase/functions/README.md](supabase/functions/README.md) — edge functions (Strava sync, KB MCP)

## Issues

Open work is tracked in [GitHub Issues](https://github.com/al-soup/soups-kitchen/issues).
