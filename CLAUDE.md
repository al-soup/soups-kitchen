# CLAUDE.md

## General

### Main Rules

- In all interactions and commit messages, be extremely concise and sacrifice
  grammar for the sake of concision.

### CI

- Run `pnpm run format` at the end of every task.
- CI runs on push: build, format:check, lint:check, unit tests.
- PR workflow: CI + e2e (Playwright, chromium only, local Supabase via `config.ci.toml`).

### Grammar & Style

- When writing markdown text follow the CommonMark lint syntax.

### Next.js

- Next.js 16+ renamed `middleware.ts` → `proxy.ts`. File lives at
  `src/proxy.ts`. See
  <https://nextjs.org/docs/messages/middleware-to-proxy#why-the-change>

## Git

### Commit Messages

- Each commit title should start with one of the following:
  - feat:
  - fix:
  - refactor:
  - chore:
  - docs:
  - build:
  - ci:
  - style:
  - perf:
  - test:
- Do not add references to Claude in the commit messages.
- Don't prompt for committing to Git unless you are asked to.

## Planning

- At the end of each plan, give me a list of unresolved questions to answer,
  if any. Make the questions extremely concise. Sacrifice grammar for the sake
  of concision.
- Every plan must include CLAUDE.md/README.md update steps if the changes
  affect project structure, patterns, or TODOs.

## Project Overview

Multi-app platform ("Soup's Kitchen") hosting small tools and my portfolio.

Apps: Habit Tracker (`/apps/habits`), Fahrplan (`/apps/fahrplan`), Knowledge Base (`/apps/knowledge-base`), Fragespiel (`/apps/fragespiel`), Resources (`/resources`), Login (`/login`), About (`/about/experience`, `/about/me`), Settings (`/settings`), Icon Gallery (`/dev/icons`, dev-only).

### Where things live

- App pages: `src/app/apps/<name>/`. KB shares form pieces in `src/app/apps/knowledge-base/_form/`.
- Layout (Shell, Navbar, Sidebar, Footer, ProfileDropdown): `src/components/layout/`.
- Shared icons: `src/constants/icons.tsx`. Render new icons at `/dev/icons`.
- Hooks: `src/hooks/` (`usePageTitle`, `useUserRole`, `useCanManage`, `useInfiniteScroll`).
- Supabase clients + generated `database.types.ts`: `src/lib/supabase/`. Migrations: `supabase/migrations/`. Seed: `supabase/seed.sql`.
- Proxy (formerly middleware): `src/proxy.ts`. Edge functions: `supabase/functions/`.
- Build helpers: `scripts/` (`ensure-supabase.sh`, `seed-resources.mjs` chains after `supabase:reset`, `strava-auth.mjs`, tech-logo generator).

### App-specific behaviors (not derivable from code)

- **Habits: Graph→Feed**: Clicking a colored day in `HabitScoreGraph` filters `HabitFeed` via `selectedDate` state. Click again or switching action type clears.
- **KB→Habit auto-link**: AFTER INSERT trigger `trg_knowledge_to_habit` on `public.knowledge` (migration `20260612000000_habit_from_knowledge.sql`) creates a habit row using action `Learning Session` (lookup by name; soft-fail w/ warning). Note = `<question>\n\n<url>`. Mirrors Strava `habit_from_strava_ride`.
- **KB-scoped fonts**: Baloo 2 / Hanken Grotesk / JetBrains Mono load globally via `next/font` but are used **only** in `knowledge-base/` CSS modules. Do not promote globally without explicit ask.
- **KB topic palette**: 8-swatch palette derived from deterministic FNV-1a hash of topic name in `_form/topicColor.ts`. No DB column.
- **KB search**: RPC `search_knowledge` combines `search_vector` tsvector + pg_trgm `word_similarity` for typo tolerance (threshold 0.2). Tag filters URL-driven by tag NAMES via repeated params.
- **Fragespiel**: Start screen picks group (Friends/Couple), language (DE/EN), round length (16/32/64, default 32), and sort (By intensity / Random, By intensity default). `buildRound()` balances the deck across intensity buckets 1-3 (round-robin draw), random category order; `displayDeck` re-sorts by difficulty when "By intensity" is chosen. Non-wrapping play deck: depth = `p - index`, so the stack shrinks toward the end; final cards swipe away one by one, then a centered "Play another round" CTA returns to the start screen. Swipe via `useSwipe.ts` (PointerEvents, 100px threshold); cards exit + re-enter on the left along one shared trajectory (`pathTransform`, p=0 TOP → p=1 FLY) so release continues the drag. prev disabled at index 0, next at index L. Footer hidden via route gate in `Shell.tsx`.

### Layout Components

- **Navbar**: Fixed top, centered brand (icon + dynamic title via PageContext) + hamburger (left) + profile (right). Brand icon is route-driven: `/apps/habits*` → `HabitsAppIcon`, `/apps/fahrplan*` → `FahrplanAppIcon`, `/apps/knowledge-base*` → `KnowledgeBaseAppIcon`, `/apps/fragespiel*` → `FragespielAppIcon`. Logo (`/soup.svg`) is the fallback. Map lives inline in `Navbar.tsx`.
- **Sidebar**: Slide-in from left, app navigation, transparent backdrop blurs main content.
- **Footer**: Minimal, centered.

### Key Patterns

- **PageContext**: Each page uses `usePageTitle(title, subtitle?)` to set navbar title.
- **PageTitle component**: `<PageTitle title="..." />` as alternative for pages that can't use the hook at top level.
- **ThemeContext**: Supports "light", "dark", "neo-brutalist" themes.
- **AuthContext**: `AuthProvider` wraps app, exposes `useAuth()` → `{ user, accessToken, loading }`. Client-side Supabase auth via `@supabase/ssr`.
- **useUserRole(table)**: Decodes JWT to extract role for a given table. Returns `{ role, loading }`.
- **useCanManage(table)**: Sugar over `useUserRole`. Returns `{ canManage, loading }` (true for `manager` or `admin`, incl. `_global=admin`). Use for gating write UI.
- **Proxy** (`src/proxy.ts`): Refreshes Supabase auth cookies on every request. Uses `createProxyClient` from `src/lib/supabase/proxy.ts`.
- **Icons**: Shared in `src/constants/icons.tsx` — check there first. Domain-specific icons (e.g. transport types) live in feature's `icons.tsx`. Display new icons at `/dev/icons`.
- **CSS Modules**: All component styles use `.module.css` files. Theme colors via `--foreground`, `--background`, `--border-color`, etc. in `globals.css`.
- **Auth redirects**: Protected pages redirect to `/login?redirectTo=<path>`. Login reads param and navigates there on success. Validate `redirectTo` starts with `/` and not `//` (open redirect prevention).
- **Avatar**: `getAvatarUrl(userId, size)` from `src/lib/avatar.ts` returns a DiceBear identicon URL. Hashes user ID with FNV-1a before sending to DiceBear (no raw UUIDs to external service).
- **Action cache**: `src/lib/actionsCache.ts` — localStorage cache for action rows (24h TTL).
- **State reset on prop change**: use `key={prop}` at mount site to remount the child fresh. Avoids synchronous `setState` in effects (triggers `react-compiler` lint error).

### Local Supabase

- Requires Docker Desktop running.
- Ports offset from defaults (API: 54221, DB: 54222, Studio: 54223).
- `pnpm supabase:start` to boot, `pnpm supabase:reset` to wipe + reseed (+ uploads dev resources).
- Seed users: `admin@local.test`, `manager@local.test`, `viewer@local.test` (pw: `password123`).
- `.env.test` points to local instance; e2e tests use it automatically.

### Auth

Three Supabase clients:

- `client.ts` — browser client (`createBrowserClient`).
- `server.ts` — server components/route handlers (`createServerClient` + cookies).
- `proxy.ts` — proxy layer (`createServerClient` + request/response cookies).

Access model:

- Public (anon allowed): KB list (`/apps/knowledge-base`) and KB detail (`/apps/knowledge-base/[id]`). RLS opens SELECT on `knowledge`, `knowledge_tags`, `tags`, `resources`, and `storage.objects` for the `resources` bucket to `anon, authenticated` — anon SELECT on `resources` is required so KB detail pages can resolve `{{resource:<id>}}` tokens to signed URLs for public viewers.
- Authenticated-only (any role): `/resources` page is client-gated via `useAuth` and redirects anon to `/login`. Underlying RLS is still public-read; the gate is purely UX so the management surface isn't publicly browsable.
- Manager-only writes: create/update/delete on KB entries + tags requires `manager` (or `admin`) role on table_name `knowledge`. Same for `resources` writes (table + storage) on table_name `resources`. Global admins (`_global=admin`) override.
- Enforced two ways: SQL helper `public.is_manager_of(target_table text)` checks the JWT and gates RLS writes; client uses `useCanManage(table)` to hide write UI.

### Scripts

- `pnpm dev` / `pnpm dev:remote` — dev server (local / remote Supabase via `.env.remote`).
- `pnpm build` — production build.
- `pnpm lint` / `pnpm lint:check` — ESLint.
- `pnpm format` / `pnpm format:check` — Prettier.
- `pnpm test` — unit tests (Jest).
- `pnpm test:e2e` / `pnpm test:e2e:ui` — Playwright (auto-starts local Supabase).
- `pnpm supabase:start` / `pnpm supabase:stop` — local Supabase (requires Docker).
- `pnpm supabase:reset` — reset DB + re-run migrations & seed + upload dev resources.
- `pnpm seed:resources` — upload files from `supabase/seed-files/` to Storage.
- `pnpm supabase:types` — regenerate `database.types.ts` from local DB.
- `pnpm generate-icons` — regenerate per-app PWA icons in `public/icons/`.
- `pnpm generate-tech-logos` — regenerate tech stack tag PNGs in `public/tech/`.
- `pnpm strava:auth` — one-time Strava OAuth setup.

### Strava Integration

Daily cron edge function `strava-activity` fetches recent Strava activities into `strava_rides`; a DB trigger then auto-creates a `Cycling` habit row. Tokens encrypted at rest via pgcrypto. Architecture, auth flow, secrets, setup, local testing, and prod-promotion steps live in [`supabase/functions/README.md`](supabase/functions/README.md).

### CI Post-merge Automation

- Workflow `.github/workflows/log-merge-habit.yml` fires on `pull_request: closed` (filtered to `merged == true`) against `main`. Inserts one habit row using action `Working on apps` (lookup by name). Note = `"Soup's Kitchen: <PR title>\n\n<PR url>\n\n<merge commit message>"` (commit message fetched via `gh api` from `pull_request.merge_commit_sha`).
- Dedicated Postgres role `ci_inserter` (migration `20260612000001_ci_inserter_role.sql`): `NOLOGIN NOINHERIT`, granted `INSERT` on `public.habit` + `USAGE,SELECT` on `habit_id_seq` + column-level `SELECT (id, name)` on `public.action`. RLS policy `"CI inserts on habit"` (`FOR INSERT TO ci_inserter WITH CHECK (true)`). Nothing else — blast radius = one INSERT on one table.
- Per-env setup (manual, not committed): `ALTER ROLE ci_inserter LOGIN PASSWORD '<long-random>'` via Supabase SQL editor.
- Secret: `CI_INSERTER_DB_URL` = session-pooler URL (`postgres://ci_inserter.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres`). Port 5432 = session pooler (not 6543 transaction). GitHub runners are IPv4-only; pooler required.
