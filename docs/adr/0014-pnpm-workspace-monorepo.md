# 0014. pnpm workspace: app in `apps/web`, Supabase stays at the root

Date: 2026-09-21

## Context

The Next.js app was the repo root. #53 expects more areas next to it, an `api` for one, and
they would have had to live inside the app's `package.json`, tsconfig and ESLint scope.
Supabase is the backend for anything that gets added (ADR-0001), so it does not belong to the
web app either.

## Decision

- pnpm workspace, `packages: apps/*`. The Next.js app is `apps/web`, package name `web`, with
  its own deps, tsconfig, Jest, Playwright, ESLint config and `vercel.json`.
- `supabase/` stays at the repo root. So do the scripts that need it: `seed-resources.mjs`,
  `strava-auth.mjs`, `ensure-supabase.sh`. The root `package.json` owns the Supabase CLI,
  Prettier and `@supabase/supabase-js` for the seed script.
- Root scripts forward app commands (`pnpm --filter web <script>`), so `pnpm dev`, `build`,
  `test` and `test:e2e` behave as before and CI calls them unchanged. `supabase:types` writes
  into `apps/web/src/lib/supabase/`.
- Prettier runs once from the root. ESLint runs per app; a small root config covers root
  `scripts/` with plain JS rules.
- No Turborepo. One package has nothing to cache or order. Revisit with the second one.
- Env files split by reader: `apps/web/.env.local` for Next.js, root `.env.local` for backend
  scripts and `supabase functions serve`.

## Consequences

- The Vercel Root Directory (`apps/web`) is a dashboard setting the repo cannot see.
  `vercel.json` has to sit in that directory or `main` auto-deploys again and ADR-0011 breaks.
  Recorded in [ops.md](../ops.md).
- Root `scripts/*.mjs` lose the Next.js ESLint rules and get `@eslint/js` recommended instead.
- `apps/` now means two things: workspace packages at the root, product Apps under
  `apps/web/src/app/apps/`. CONTEXT.md keeps "App" for the product sense only.
- ADRs 0001 to 0013 keep their old `src/...` paths. Read them as relative to `apps/web/`.
