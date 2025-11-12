# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## General

### Main Rules

- In all interactions and commit messages, be extremely concise and sacrifice
grammar for the sake of concision.

### Grammer & Style

- When writing markdown text follow the CommonMark lint syntax.

## Git

### Commit Messages

- Each commit title should start with one of the following:
  - feat:
  - fix:
  - refactor:
  - chore:
  - docs:
- Do not add references to Claude in the commit messages

## Planning

- At the end of each plan, give me a list of unresolved questions to answer,
if any. Make the questions extremely concise. Sacrifice grammar for the sake
of concision. I

## Project Overview

Multi-app platform ("Soup's Kitchen") hosting small tools. SvelteKit 2.x with Svelte 5, TypeScript, Vite, Vercel deploy. Uses pnpm.

Current apps: Habit Tracker (/habits), Blog (/blog), CV (/cv), Settings (/settings).

## Development Commands

### Setup

```bash
pnpm install
```

### Development Server

```bash
pnpm dev                    # Start dev server
pnpm dev -- --open          # Start dev server and open browser
```

### Building & Preview

```bash
pnpm build                  # Create production build
pnpm preview                # Preview production build locally
```

### Code Quality

```bash
pnpm lint                   # Run Prettier check and ESLint
pnpm format                 # Format all files with Prettier
pnpm check                  # Run svelte-check for type checking
pnpm check:watch            # Run svelte-check in watch mode
```

### Testing

```bash
pnpm test:unit              # Run Vitest unit tests (interactive)
pnpm test:unit -- --run     # Run unit tests once
pnpm test:e2e               # Run Playwright e2e tests
pnpm test                   # Run all tests (unit + e2e)
```

#### Running Specific Tests

- Unit tests: `pnpm test:unit -- src/path/to/file.spec.ts`
- E2E tests: `pnpm test:e2e -- e2e/demo.test.ts`

## Architecture

### Framework & Build System

- **Framework**: SvelteKit 2.x with Svelte 5 (using runes API)
- **Build Tool**: Vite 7.x
- **Deployment**: Vercel adapter (`@sveltejs/adapter-vercel`)
- **Language**: TypeScript (strict mode enabled)

### Testing Strategy

The project uses a dual testing approach configured in vite.config.ts:

1. **Browser Tests (Client)**: For Svelte component tests
   - Runner: Vitest with Playwright provider
   - Pattern: `src/**/*.svelte.{test,spec}.{js,ts}`
   - Runs in Chromium browser environment
   - Excludes: `src/lib/server/**`

2. **Node Tests (Server)**: For server-side logic
   - Runner: Vitest with Node environment
   - Pattern: `src/**/*.{test,spec}.{js,ts}`
   - Excludes: Svelte component tests

3. **E2E Tests**: For full application testing
   - Runner: Playwright
   - Location: `e2e/` directory
   - Runs against production build on port 4173

### Project Structure

- **src/routes/**: SvelteKit file-based routing (apps at root: /habits, /blog, /cv, /settings)
  - `+page.svelte`: Page components
  - `+layout.svelte`: Layout components (includes Navbar, Sidebar, Footer)
- **src/lib/**: Shared library code (aliased as `$lib`)
  - **src/lib/components/**: Reusable components (Navbar, Sidebar, Footer)
  - **src/lib/themes/**: Theme system (types, configs, index)
  - **src/lib/stores/**: Svelte 5 stores (theme.svelte.ts)
  - **src/lib/assets/**: Static assets
  - **src/lib/server/**: Server-only code (excluded from client tests)
- **src/app.css**: Global styles, CSS variables, Tailwind imports
- **e2e/**: Playwright end-to-end tests
- **static/**: Static files (soup.svg logo)

### Key Configuration Files

- **svelte.config.js**: SvelteKit configuration with Vercel adapter and Vite preprocessor
- **vite.config.ts**: Vite and Vitest configuration with separate client/server test projects
- **tsconfig.json**: Extends `.svelte-kit/tsconfig.json` with strict TypeScript settings
- **eslint.config.js**: ESLint configuration using flat config format with TypeScript and Svelte support
- **playwright.config.ts**: Playwright configuration that builds and previews the app before testing

### Svelte 5 Specifics

This project uses Svelte 5 with the new runes API:

- Use `$props()` for component props (e.g., `let { children } = $props()`)
- Use `@render` directive for rendering snippets/children
- SvelteKit sync must run before type checking to generate types

### TypeScript & Path Aliases

- Path aliases are managed by SvelteKit configuration
- `$lib` alias automatically maps to `src/lib`
- TypeScript extends `.svelte-kit/tsconfig.json` which is auto-generated

### Styling & Theme System

**Stack**: Tailwind CSS 4.x with `@tailwindcss/vite` plugin

**Theme Architecture** (designed for easy customization/switching):

- **CSS Variables**: All design tokens in `:root` (colors, fonts, borders, shadows, spacing)
- **Theme Configs**: `src/lib/themes/[theme-name].ts` exports `Theme` object
- **Theme Store**: `src/lib/stores/theme.svelte.ts` applies themes via CSS var updates
- **Types**: `src/lib/themes/types.ts` defines `Theme` interface

**Current Theme**: Neo-brutalist

- White bg, yellow/orange accents, black borders
- Space Grotesk font, 3px borders, hard shadows
- Mat aesthetic, no gradients/blur

**Adding Themes**: Create new theme config file, add to `src/lib/themes/index.ts`, call `themeStore.setTheme(name)`

**Layout Components**:

- **Navbar**: Fixed top, centered logo + "Soup's Kitchen" title, dynamic subtitle, hamburger (left), profile icon (right)
- **Sidebar**: Slide-in from left, app navigation, transparent backdrop blurs main content
- **Footer**: Minimal, centered

**Custom Utilities** (in app.css): `shadow-brutal-sm/md/lg`, `border-brutal`
