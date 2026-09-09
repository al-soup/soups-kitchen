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

## Auth model

- Public reads: Knowledge Base (list, detail, resource signed URLs)
- Auth required: `/resources` page (any role)
- Manager / admin: writes on KB, tags, resources — gated by RLS via `is_manager_of(table)`

## Testing

- `pnpm test` — Jest, jsdom, colocated `*.test.ts(x)`
- `pnpm test:e2e` — Playwright, chromium, auto-boots local Supabase from `config.ci.toml`
- CI: unit + format + lint on push; PR adds e2e

## PWA Support

All apps under _/apps_ are installable as PWAs (Android "Add to Home Screen", iOS home screen icon). Each app has its own web app manifest and icons. Run `pnpm generate-icons` to regenerate icons from `public/soup.svg`.

## TODO

Tracked in [GitHub Issues](https://github.com/al-soup/soups-kitchen/issues).
