# 0009. KB fonts load globally but stay KB-only

Date: 2026-09-09

## Context

The Knowledge Base has its own visual identity (Baloo 2, Hanken Grotesk, JetBrains Mono); the
rest of the platform uses the system font stack. `next/font` only injects its CSS variables
reliably from the root layout, so the fonts cannot be registered inside the KB route alone.

## Decision

The fonts are registered in `src/app/layout.tsx` but referenced only from
`src/app/apps/knowledge-base/` CSS modules.

## Consequences

- The font files ship on every page even though only the KB uses them; accepted cost.
- Seeing the variables defined globally is not an invitation to use them elsewhere. Promoting
  the fonts to `globals.css` or another app is a design decision, not a cleanup.
