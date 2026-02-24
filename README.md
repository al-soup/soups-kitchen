# Soup's Kitchen

Multi-app platform hosting small tools and portfolio.

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

## Scripts

| Command                | Description                                 |
| ---------------------- | ------------------------------------------- |
| `pnpm dev`             | Dev server (local Supabase)                 |
| `pnpm dev:remote`      | Dev server (remote Supabase via `.env.remote`) |
| `pnpm build`           | Production build                            |
| `pnpm lint`            | ESLint fix                                  |
| `pnpm lint:check`      | ESLint check                                |
| `pnpm format`          | Prettier fix                                |
| `pnpm format:check`    | Prettier check                              |
| `pnpm test`            | Run unit tests                              |
| `pnpm test:e2e`        | Run Playwright tests (auto-starts Supabase) |
| `pnpm test:e2e:ui`     | Playwright UI mode                          |
| `pnpm supabase:start`  | Start local Supabase                        |
| `pnpm supabase:stop`   | Stop local Supabase                         |
| `pnpm supabase:reset`  | Reset DB + rerun migrations & seed          |
| `pnpm supabase:types`  | Regenerate `database.types.ts`              |

## TODO

- [ ] Add e2e & unit tests
- [ ] Add CI user that can create a habit entry when working on the app
- [x] Set-up local supabase. Import the prod schemas and functions.
- [ ] Build agent for writing and improving e2e test
- [ ] Add `redirectTo` param to all protected page redirects (currently only `/habits/create`)
- [ ] Some apps will not require a theme / should be able to introduce their own theme and overwrite the defaults so there is more of a standalone app feel.

### Minor

- [ ] Extract icons to lib

## Review

- [ ] Look into react hooks, context and global stores. See if this is done correctly for theme/title switching
