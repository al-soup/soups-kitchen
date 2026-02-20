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

Current apps: Habit Tracker (/habits), Login (/login), Blog (/work/experience), CV (/work/cv), Settings (/settings).

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

### Auth

Three Supabase clients:

- `client.ts` — browser client (`createBrowserClient`)
- `server.ts` — server components/route handlers (`createServerClient` + cookies)
- `proxy.ts` — proxy layer (`createServerClient` + request/response cookies)

### File Structure

```text
src/
  app/           # Next.js app router pages
    auth/        # OAuth callback route
    habits/      # Habit tracker (list + create)
    login/       # Login page
    settings/    # Settings page
    work/        # CV + Experience pages
  components/
    layout/      # Shell, Navbar, Sidebar, Footer, ProfileDropdown
    ui/          # HabitScoreGraph, PageTitle, ThemeSwitcher
  constants/     # Theme config + icons
  context/       # ThemeContext, PageContext, AuthContext
  hooks/         # usePageTitle, useUserRole
  lib/
    supabase/    # client, server, proxy, database.types, types
  proxy.ts       # Next.js proxy (formerly middleware)
```

### Scripts

- `pnpm dev` - dev server
- `pnpm build` - production build
- `pnpm lint` / `pnpm lint:check` - ESLint
- `pnpm format` / `pnpm format:check` - Prettier
- `pnpm test` - unit tests (Jest)
- `pnpm test:e2e` - Playwright tests
- `pnpm test:e2e:ui` - Playwright UI mode

### CI

- CI runs on push: build, format:check, lint:check, unit tests
- PR workflow: CI + e2e (Playwright, chromium only)
