# CLAUDE.md

## General

### Main Rules

- In all interactions and commit messages, be extremely concise and sacrifice
  grammar for the sake of concision.

### Grammar & Style

- When writing markdown text follow the CommonMark lint syntax.

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

## Project Overview

Multi-app platform ("Soup's Kitchen") hosting small tools as well as my portfolio.

Current apps: Habit Tracker (/habits), Blog (/work/experience), CV (/work/cv), Settings (/settings).

### Layout Components

- **Navbar**: Fixed top, centered logo + dynamic title (via PageContext), hamburger (left), profile icon (right)
- **Sidebar**: Slide-in from left, app navigation, transparent backdrop blurs main content
- **Footer**: Minimal, centered

### Key Patterns

- **PageContext**: Each page uses `usePageTitle(title, subtitle?)` hook to set navbar title
- **ThemeContext**: Supports "light", "dark", "neo-brutalist" themes
- **CSS Modules**: All component styles use `.module.css` files
- **CSS Variables**: Theme colors via `--foreground`, `--background`, `--border-color`, etc. in globals.css

### File Structure

```text
src/
  app/           # Next.js app router pages
  components/
    layout/      # Shell, Navbar, Sidebar, Footer, ProfileDropdown
    ui/          # Reusable UI components (ThemeSwitcher)
  constants/     # App constants (theme config)
  context/       # React contexts (ThemeContext, PageContext)
  hooks/         # Custom hooks (usePageTitle, useTheme)
```

### Scripts

- `pnpm dev` - dev server
- `pnpm build` - production build
- `pnpm lint` / `pnpm lint:check` - ESLint
- `pnpm format` / `pnpm format:check` - Prettier
- `pnpm test:e2e` - Playwright tests
