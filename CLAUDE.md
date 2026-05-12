# CLAUDE.md

## General

### Main Rules

- In all interactions and commit messages, be extremely concise and sacrifice
  grammar for the sake of concision.

### CI

- Run `pnpm run format` at the end of every task.
- CI runs on push: build, format:check, lint:check, unit tests
- PR workflow: CI + e2e (Playwright, chromium only, local Supabase via `config.ci.toml`)

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

Current apps: Habit Tracker (/apps/habits), Fahrplan (/apps/fahrplan), Knowledge Base (/apps/knowledge-base — overview + detail + tags admin + create/edit + tag filters + full-text search w/ typo tolerance), Resources (/resources — standalone file uploads, reusable across apps), Login (/login), Experience (/about/experience), Me (/about/me), Settings (/settings), Icon Gallery (/dev/icons, dev-only).

#### Habits: Graph→Feed interaction

Clicking a colored day in `HabitScoreGraph` sets `selectedDate` state, which filters `HabitFeed` to that date. Clicking again clears. Switching action type also resets `selectedDate`. Feed shows a filter chip with clear button when filtered.

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
- **Icons**: Shared icons live in `src/constants/icons.tsx`. Check there first before creating new SVG icons; add new ones there too. Domain-specific icons (e.g. transport types) live in their feature's `icons.tsx`. Display new icons `src/app/dev/icons/page.tsx`.
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
    api/fahrplan/ # Proxy routes for search.ch (completion, stationboard)
    apps/        # Apps hub + Habit tracker + Fahrplan + Knowledge Base
      fahrplan/       # Swiss departure board (StationSearch, DepartureBoard, DepartureRow)
      habits/         # HabitFeed (paginated feed, grouped by date), HabitTypeSelector
      habits/create/  # api.ts for action fetch + habit insert; ActionList/ActionRow components
      knowledge-base/ # Overview list (compact cards, reverse-chrono, pagination)
                      # + top toolbar linking to /create, /tags, /resources.
                      # SearchBox above the toolbar: debounced 250ms, URL-driven
                      # (?q=…). Full-text search via search_vector tsvector +
                      # pg_trgm word_similarity fallback for typo tolerance
                      # (function-local threshold 0.2). When q is set, results
                      # rank by ts_rank + word_similarity, tie-break by date.
                      # Tag filter rows (Topics + Concepts) below the toolbar:
                      # multi-select pills, URL-driven by tag NAMES via repeated
                      # params (?topics=Databases&topics=Networking&concepts=…).
                      # Names → ids resolved client-side via tagsByName map; the
                      # knowledge fetch waits for the tag list when tag filters
                      # are in the URL (q-only fetches don't wait). OR within a
                      # category, AND across categories; q AND-composes with
                      # both. Tags render as a mono-font breadcrumb path
                      # ([topic1, topic2 > concept1 concept2]).
      knowledge-base/tags/  # Tags admin (api.ts CRUD, TagSection, TagRow); topic & concept
      knowledge-base/create/  # New entry form page (uses KnowledgeForm)
      knowledge-base/[id]/   # Single route per entry: Preview ↔ Edit toggle.
                             # Page owns draft+committed state so the preview reflects
                             # in-progress edits. Cancel/Save/Delete action bar appears
                             # in both views once dirty (and always in edit mode).
                             # Back arrow + beforeunload prompt when dirty. Mode toggle
                             # uses PencilIcon (Edit) / EyeIcon (Preview).
      knowledge-base/_form/   # Private shared: KnowledgeFields (controlled fields:
                              # question, summary, detail, TagPicker, ResourcePicker),
                              # KnowledgeForm (uncontrolled wrapper for create page),
                              # MarkdownDetail (react-markdown + remark-gfm),
                              # TagBreadcrumb (uppercase topics ❯ concepts, size sm|md),
                              # TagPills (multi-select filter pills, shared
                              # pills.module.css), SearchBox (debounced text
                              # input + clear button), filterParams
                              # (buildKnowledgeQuery using repeated
                              # URLSearchParams + ?q=…; toggleString;
                              # TOPICS/CONCEPTS/Q_PARAM),
                              # format.ts (formatDate "1. May 2026" + formatDateTime
                              # "1. May 2026, 14:30" — 24h), resolveResourceTokens
                              # (regex extract/replace), types.ts (KnowledgeFormInitial,
                              # isDraftDirty), api.ts (listKnowledge via
                              # search_knowledge RPC, get/update/delete by number id)
    resources/   # Standalone resources module (upload to Supabase Storage)
                 # UploadDropzone, ResourceGrid, ResourceCard; api.ts CRUD + signed URLs
                 # Placeholder token: {{resource:<uuid>}}
    auth/        # OAuth callback route
    login/       # Login page
    settings/    # Settings page
  components/
    layout/      # Shell, Navbar, Sidebar, Footer, ProfileDropdown
    ui/          # HabitScoreGraph, PageTitle, ThemeSwitcher
  constants/     # Theme config, theme icons, shared icons (Menu, User, LogIn, Settings, LogOut, Pencil, Eye, Trash, Copy, Check, Search, X)
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
  functions/     # Supabase Edge Functions (Deno)
    strava-activity/  # Daily cron: fetch Strava activities
  migrations/    # Schema migrations (pulled from remote)
  seed.sql       # Dev seed data (3 users, actions, habits, KB tags + 5 KB entries)
public/
  tech/          # Generated tech logo PNGs (via generate-tech-logos)
scripts/
  ensure-supabase.sh  # Auto-starts local Supabase if not running
  generate-tech-logos.mjs  # Generate tech stack tag PNGs
  seed-resources.mjs   # Upload supabase/seed-files/* into Storage (chained after reset)
  strava-auth.mjs  # One-time Strava OAuth token setup
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
- `pnpm supabase:reset` - reset DB + re-run migrations & seed + upload any dev resources
- `pnpm seed:resources` - upload files from `supabase/seed-files/` to Storage
- `pnpm supabase:types` - regenerate `database.types.ts` from local DB
- `pnpm generate-icons` - regenerate per-app PWA icons in `public/icons/`
- `pnpm generate-tech-logos` - regenerate tech stack tag PNGs in `public/tech/`
- `pnpm strava:auth` - one-time Strava OAuth setup (stores tokens in DB)

### Strava Integration

- Edge function `strava-activity` fetches recent Strava activities via cron (daily)
- Tokens stored in `strava_tokens` table, auto-refreshed on each run (Strava rotates refresh tokens)
- Endpoint protected by `x-cron-secret` header (not JWT)
- Setup: run `pnpm strava:auth` once, then deploy edge function + set secrets
- Secrets: `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `CRON_SECRET`
