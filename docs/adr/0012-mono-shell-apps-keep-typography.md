# 0012. Mono shell and portfolio; apps keep their own typography

Date: 2026-09-17

## Context

The 2026 redesign gives the platform one identity: dark by default, coral accent `#f7768e`,
IBM Plex Mono for body text and JetBrains Mono for labels, menus and headings. The apps were
designed around Inter and Space Grotesk, and dense views (habit tables, the departure board)
read worse in a monospace face.

## Decision

- Colour tokens and the accent are global (`src/app/globals.css`); dark is the default theme
  and `:root` carries its values, `[data-theme="light"]` overrides. Only light and dark exist.
- The mono stack applies to the shell (top bar, drawer), landing, `/about/*`, `/profile`,
  `/login` and the `/apps` index.
- Everything inside an app is wrapped by `AppFrame`, which re-points `--font-sans` and
  `--font-display` to Inter and Space Grotesk. Removing those two overrides turns apps mono.
- `next/font` variables sit on `<html>`, because `globals.css` resolves the font tokens on
  `:root`.
- Navigation is a directory listing. Group labels (`/about`, `/apps`, `/tools`) are inert; the
  index pages behind them stay reachable by URL but are never linked. Menu paths are real
  paths, which is why Resources lives at `/tools/resources`.
- The top bar is hidden on `/`. Its brand mark is the only link home; app icon and breadcrumb
  are inert.

## Consequences

- Amends [0009](./0009-kb-scoped-typography.md): JetBrains Mono is now a site-wide font.
  Baloo 2 and Hanken Grotesk remain KB-only.
- A stored theme value that no longer exists (e.g. `neo-brutalist`) falls back to dark.
- A new app needs an entry in `src/constants/apps.ts` (menus, `/apps` index, manifest, top bar
  icon) and in `scripts/generate-icons.mjs`, plus a layout that renders `AppFrame`.
