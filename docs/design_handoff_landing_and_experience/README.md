# Handoff: New landing page + /about/experience for soups-kitchen

Repo: `al-soup/soups-kitchen` (Next.js app under `src/app`). The design reference lives in `About Me Explorations.dc.html` — open it in a browser; **row 5 (options 5a–5d, top of the canvas)** is the approved design. Rows 1–4 are earlier explorations and can be ignored.

## Owner's instructions (do these)

- Implement the new landing page (5a dark / 5b light / 5c mobile) at `/` and **replace `/about/me` with the new CV version (5d)**, served at `/about/experience`. Delete the old landing page and the old `/about/me` page (redirect `/about/me` → `/about/experience` is fine).
- Keep the existing drawer-menu component, but **open it from the right**, since the hamburger now sits top right. Its contents become the directory tree described below.
- **Remove the neo-brutalist theme** entirely.
- The **login and the theme switch** currently in the top bar move **into the open drawer menu** (bottom of the drawer).
- **Remove the footer everywhere.**
- Top bar: **hidden on the landing page** (only the hamburger shows, plus the small "ALEX KRÄUCHI" label top-left). **Shown on all other pages** (5d shows the top bar treatment).

## About the design files

The HTML in this bundle is a **design reference**, not production code. Recreate it in the existing Next.js codebase using its patterns (CSS modules / existing theme tokens). Do not copy the runtime files (`support.js`, `image-slot.js`) into the app.

## Fidelity

**High-fidelity.** Colors, type, spacing and copy are final except the intro paragraphs, which the owner will rewrite later (keep them as content, not hard-coded markup, so they are easy to swap).

## Design tokens

Fonts (Google Fonts): **IBM Plex Mono** 400/500/600 for body text; **JetBrains Mono** 400/500/700 for labels, menu, headings and the large "soup" cut-out.

Colors
- Accent: `#f7768e` (coral) — replaces the current orange/red accent everywhere
- Dark theme: bg `#0f0f0f`, text `#ededed`, muted `#8f8f8f`, faint `#666`, hairline `#222`, borders `#333`
- Light theme: bg `#fafaf7`, text `#171717`, muted `#666`, hairline `#e5e5e5`
- Link color in markdown-style CV: `#6b9bc5`
- Wave stripes (existing palette, keep): `#0d1931 #142744 #1a3a5c #1f4a6e #2e5178 #163050 #4a7ba7 #6b9bc5`

Spacing: page padding 48px desktop / 20px mobile; section gaps 32–56px; menu line-height 2 (13px font) desktop, 2.4 (14px) mobile.

Waves: reuse the **existing animated wave component** from `src/app/page.tsx` (feTurbulence + feDisplacementMap over repeating stripes). The reference re-implements it with `baseFrequency 0.015 0.003`, 2 octaves, displacement scale 45, 16s loop.

## Screens

### 1. Landing `/` (5a dark, 5b light, 5c mobile)

Layout, top to bottom:

1. **Hero band**, full width, height 420px desktop / 300px mobile, `overflow:hidden`. Waves fill the band. Over it sits an SVG mask: a rect in the page background color with the word **`soup`** cut out (JetBrains Mono 700, ~400px font-size on an 1100px-wide viewBox, letter-spacing −20; mobile: 150px on 390 viewBox, letter-spacing −8; baseline ~60px above the band's bottom edge, left offset 48px / 20px). Result: the waves are visible **only through the letters**. Use `preserveAspectRatio="none"` so the word scales with width, or size the font with `vw`.
2. **Header row**, absolutely positioned inside the band, top 32px (20px mobile), left/right 48px (20px): left `ALEX KRÄUCHI` in JetBrains Mono 12px, letter-spacing .08em, uppercase, color muted; right the **hamburger** — two 22px × 2px bars, 5px gap, 8px padding, no top bar. When the drawer is open the two bars rotate ±45° into an ×. Header row must sit above the drawer (`z-index` higher).
3. **Body**, padding 32px 48px 56px, two-column grid `minmax(0,1fr) 320px`, gap 56px. On mobile a single column with padding 12px 20px 32px.
   - Left: two paragraphs. P1 IBM Plex Mono 17px/1.7 in text color; P2 15px/1.7 in muted. Copy (placeholder, owner will rewrite):
     > Hi, I'm Alex. Software engineer in Zurich. Election maps for a newspaper, an ERP nobody will ever see, CMS infrastructure for the Swiss government. Business degree, then the terminal.
     >
     > Bikes, board games, history podcasts. This is my kitchen.
   - Right: **directory menu** (see below). On mobile it becomes the page footer, separated by a 1px hairline and 16px padding-top.

No footer, no top bar, no other links.

### 2. Directory menu (inline on landing + inside the drawer)

Rendered as rows in JetBrains Mono 13px (14px mobile/drawer), line-height 2. Each row is `display:flex`; the first cell is a fixed-width label column (80px inline, 88px drawer, 76px mobile) so children align under the first child.

```
/about   / me
         / experience
/apps    / habits
         / fahrplan
         / knowledge-base
         / fragespiel
```

- Group labels (`/about`, `/apps`) in accent `#f7768e`, not links.
- Children are links in text color; the current page's sibling can be muted.
- 8–10px extra margin before each new group.
- Build the `/apps` list from the existing apps config so new apps appear automatically.

### 3. Drawer (existing component, adapted)

- Slides in **from the right**, width 360px (full width on mobile), background `rgba(15,15,15,.96)` dark / `rgba(250,250,247,.97)` light, 1px left hairline, padding 80px 48px.
- Content: the directory menu above. **At the bottom: theme switch and login**, styled as further tree rows or small mono labels — the owner explicitly wants them here instead of the top bar.
- Hamburger stays visible above the drawer and turns into an ×; clicking outside or × closes.

### 4. `/about/experience` (5d) — replaces `/about/me`

Max content width 820px, centered, padding 0 56px 56px. Fonts: JetBrains Mono throughout, 14px/1.9 body.

1. **Top bar** (shown on non-landing pages): padding 18px 56px, 1px bottom hairline. Left: **logo B mini mark** (see Logo) + `soup` 12px, letter-spacing .08em, links to `/`. Right: breadcrumb `/about / experience` with `/about` in accent, then the hamburger.
2. **Wave strip**, 160px tall, masked to fade out toward the bottom (`linear-gradient(#000 50%, transparent)`). No label text on it.
3. **Heading block**: grid `minmax(0,1fr) 120px`, gap 32px. Left: `# alex kräuchi` 30px/700 white with the `#` in accent; below, `software engineer · zürich · since 2017` 13px muted. Right: **portrait slot** 120×150px, 1px `#333` border, `filter: grayscale(1) contrast(1.15)`; render `public/portrait.jpg` if present, otherwise nothing.
4. `## work` 20px/700 with `##` in accent. Then one block per job, 22px apart:
   - `### {company}` 16px/700 white, followed by the years in 12px `#666`
   - `_{role}_` 13px muted (literal underscores, markdown flavor)
   - one-sentence summary 14px `#c8c8c8`
   - `` `{tech}` `` 12.5px `#6b9bc5`, literal backticks
5. `## before` → two list lines 13.5px muted: `- M.Sc. Information Systems, Univ. Bern` and `- Swiss Press Award 2024 · European Newspaper Award 2023 · POY 2024`
6. `## links` → markdown-style list, link text in `#6b9bc5`, URL in parentheses in body color: github, linkedin, mail, pdf.
7. **Sign-off row**: 48px margin-top, 1px hairline, `last updated {date}` 12px `#666` left; the **original painterly disc** `public/soup.svg` 56px round on the right. This is the only place the old disc remains.

Content (from the existing `src/app/about/me/data.ts`, condensed):

- **Swisscom**, 2025, DevOps Engineer — CMS infrastructure for the Swiss government: backend, frontend, CI/CD. `go · node · nuxt · kubernetes · gitlab ci`
- **NZZ**, 2022 – 2024, Senior Software Engineer — Interactive visuals and election coverage; three journalism awards along the way. `typescript · sveltekit · d3 · node · couchdb`
- **Smallstack**, 2020 – 2022, Software Engineer · Product Owner — Full-stack work on an ERP/CRM product, plus a contract in a frontend team at Allianz. `typescript · angular · nestjs · java · mongodb`
- **Univ. Bern, FDN**, 2017 – 2020, Software Engineer — Research and consulting projects around open source and open data. `typescript · angular · d3 · python · mysql`

Drop the old page's chips, company logos, languages and interests. Light theme variant: same layout with light tokens.

## Logo

- **Logo B (primary mark)**: monoline concentric circles. Full size: 4 rings at r=56/42/28/14 on a 120 viewBox, stroke 2, outer three in text color, innermost in accent, 3px accent dot at center.
- **Mini mark (top bar / favicon)**: 2 rings, r=52 in text color and r=24 in accent, stroke 10, on a 120 viewBox; rendered at 22px next to the wordmark `soup`.
- Drop the gradient "Soup's Kitchen" wordmark. Keep `public/soup.svg` only for the CV sign-off.

## Interactions

- Hamburger toggles drawer; bars animate to × (`transform .2s`).
- Drawer slide-in from right ~200ms ease-out.
- Waves animate continuously (existing behavior).
- Theme switch (in drawer) toggles dark/light tokens; both landing variants must work.
- Portrait image renders B&W via CSS filter regardless of source.

## Files in this bundle

- `About Me Explorations.dc.html` — design reference (row 5 is the approved set; rows 1–4 are history)
- `support.js`, `image-slot.js` — runtime needed only to open the reference in a browser
- `public/soup.svg` — original disc, for the CV sign-off
- `screenshots/` — row 5 captures
