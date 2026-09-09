# KB fonts load globally but stay KB-only

Baloo 2, Hanken Grotesk and JetBrains Mono are registered through `next/font`
in the root layout (the only place `next/font` can inject CSS variables
reliably) but are referenced only from `src/app/apps/knowledge-base/` CSS
modules. The Knowledge Base has its own visual identity; the rest of the
platform keeps the system font stack. Do not "promote" these fonts to
`globals.css` or other apps without an explicit design decision.
