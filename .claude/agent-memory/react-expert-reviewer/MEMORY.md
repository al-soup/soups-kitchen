# React Expert Reviewer Memory

## Project Stack
- Next.js 16.1.6 (App Router) + React 19.2.3 + TypeScript 5.x
- CSS Modules + CSS variables for theming
- pnpm, Playwright e2e, ESLint (next core-web-vitals + TS)
- No API routes, no server actions, no auth -- purely client-side app so far

## Architecture Patterns
- **Every page is "use client"** due to `usePageTitle()` hook. Key refactor opportunity: extract `<PageTitle>` client component to keep pages as RSC.
- **ThemeContext** uses `useLayoutEffect` + localStorage + `data-theme` attribute. Flash-prevention inline script in `layout.tsx` via `dangerouslySetInnerHTML`.
- **PageContext** stores title/subtitle, consumed by Navbar. Two separate `useState` calls for title/subtitle.
- **Shell** is the layout wrapper: Navbar + Sidebar + main + Footer. All client-side.
- **Barrel exports** (`index.ts`) for all component folders. Navbar bypasses ProfileDropdown's barrel (imports direct file).

## Known Issues (from full review 2026-02-12)
- No CSP or security headers in `next.config.ts`
- Sidebar/ProfileDropdown missing Escape key handlers
- Shell creates unstable callbacks every render
- Duplicate `THEMES` array in ThemeSwitcher + ProfileDropdown
- 3 page CSS modules are byte-identical (habits, cv, experience)
- `useTheme` hook is a trivial passthrough

## CSS Variable System
- Theme vars: `--background`, `--background-alt`, `--foreground`, `--foreground-muted`, `--border-color`, `--border-width`, `--shadow`, `--shadow-lg`, `--radius-sm/md/lg`
- Layout vars: `--navbar-height`, `--sidebar-width`
- Font vars: `--font-sans`, `--font-display`
- Themes: `light` (default/:root), `dark`, `neo-brutalist` via `[data-theme]` selector
