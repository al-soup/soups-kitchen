# CLAUDE.md

## General

### Main Rules

- In all interactions and commit messages, be extremely concise and sacrifice
  grammar for the sake of concision.

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

Multi-app platform ("Soup's Kitchen") hosting small tools as well as my portfolio.

Current apps: Habit Tracker (/apps/habits), Login (/login), Experience (/about/experience), Me (/about/me), Settings (/settings).

### Layout Components

- **Navbar**: Fixed top, centered logo + dynamic title (via PageContext), hamburger (left), profile icon (right)
- **Sidebar**: Slide-in from left, app navigation, transparent backdrop blurs main content
- **Footer**: Minimal, centered

### Key Patterns

- **PageContext**: Each page uses `usePageTitle(title, subtitle?)` hook to set navbar title
- **PageTitle component**: `<PageTitle title="..." />` as alternative to calling `usePageTitle()` directly (for pages that can't use the hook at top level)
- **ThemeContext**: Supports "light", "dark", "neo-brutalist" themes
- **AuthContext**: `AuthProvider` wraps app, exposes `useAuth()` → `{ user, accessToken, loading }`. Client-side Supabase auth via `@supabase/ssr`.
- **useUserRole(table)**: Decodes JWT to extract role for a given table. Returns `{ role, loading }`.
- **Proxy** (`src/proxy.ts`): Refreshes Supabase auth cookies on every request. Uses `createProxyClient` from `src/lib/supabase/proxy.ts`.
- **CSS Modules**: All component styles use `.module.css` files
- **CSS Variables**: Theme colors via `--foreground`, `--background`, `--border-color`, etc. in globals.css
- **Auth redirects**: Protected pages redirect to `/login?redirectTo=<path>`. Login reads param and navigates there on success. Validate `redirectTo` starts with `/` and not `//` (open redirect prevention).
- **Avatar**: `getAvatarUrl(userId, size)` from `src/lib/avatar.ts` returns a DiceBear identicon URL. Hashes user ID with FNV-1a before sending to DiceBear (no raw UUIDs to external service). Used in ProfileDropdown trigger and Settings account section.
- **State reset on prop change**: use `key={prop}` at the mount site to remount the child fresh. Avoids synchronous `setState` calls inside effects (triggers `react-compiler` lint error).

### Local Supabase

- Requires Docker Desktop running
- Ports offset from defaults to avoid conflicts (API: 54221, DB: 54222, Studio: 54223)
- `pnpm supabase:start` to boot, `pnpm supabase:reset` to wipe + reseed
- Seed users: `admin@local.test`, `manager@local.test`, `viewer@local.test` (pw: `password123`)
- `.env.test` points to local instance; e2e tests use it automatically

### Auth

Three Supabase clients:

- `client.ts` — browser client (`createBrowserClient`)
- `server.ts` — server components/route handlers (`createServerClient` + cookies)
- `proxy.ts` — proxy layer (`createServerClient` + request/response cookies)

### File Structure

```text
src/
  app/           # Next.js app router pages
    about/       # About stub + Experience + Me pages
    apps/        # Apps hub + Habit tracker (list + create)
      habits/         # HabitFeed (paginated feed, grouped by date), HabitTypeSelector
      habits/create/  # api.ts for action fetch + habit insert; ActionList/ActionRow components
    auth/        # OAuth callback route
    login/       # Login page
    settings/    # Settings page
  components/
    layout/      # Shell, Navbar, Sidebar, Footer, ProfileDropdown
    ui/          # HabitScoreGraph, PageTitle, ThemeSwitcher
  constants/     # Theme config, theme icons, shared icons (Menu, User, LogIn, Settings, LogOut)
  context/       # ThemeContext, PageContext, AuthContext
  hooks/         # usePageTitle, useUserRole
  lib/
    actionsCache.ts  # localStorage cache for action rows (24h TTL)
    avatar.ts    # DiceBear identicon URL helper
    supabase/    # client, server, proxy, database.types, types
  proxy.ts       # Next.js proxy (formerly middleware)
supabase/
  config.toml    # Local Supabase config
  config.ci.toml # CI Supabase config (unused services disabled, default ports)
  migrations/    # Schema migrations (pulled from remote)
  seed.sql       # Dev seed data (3 users, 6 actions, 5 habits)
scripts/
  ensure-supabase.sh  # Auto-starts local Supabase if not running
```

### Scripts

- `pnpm dev` - dev server (local Supabase)
- `pnpm dev:remote` - dev server (remote Supabase via `.env.remote`)
- `pnpm build` - production build
- `pnpm lint` / `pnpm lint:check` - ESLint
- `pnpm format` / `pnpm format:check` - Prettier
- `pnpm test` - unit tests (Jest)
- `pnpm test:e2e` - Playwright tests (auto-starts local Supabase)
- `pnpm test:e2e:ui` - Playwright UI mode
- `pnpm supabase:start` - start local Supabase (requires Docker)
- `pnpm supabase:stop` - stop local Supabase
- `pnpm supabase:reset` - reset DB + re-run migrations & seed
- `pnpm supabase:types` - regenerate `database.types.ts` from local DB

### CI

- CI runs on push: build, format:check, lint:check, unit tests
- PR workflow: CI + e2e (Playwright, chromium only, local Supabase via `config.ci.toml`)
