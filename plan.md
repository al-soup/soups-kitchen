# Knowledge Base — Plan & Progress

## Context

Build `/apps/knowledge-base` to capture short Q&A bits (question + 1–2 sentence
summary + optional markdown detail). Entries grouped by **tags** of two kinds:

- **topic** — broad area (e.g. "System Design")
- **concept** — fine-grained (e.g. "DB Indexing")

Markdown detail may reference attached resources stored in Supabase Storage.
Resources are decoupled from knowledge — they're a standalone, reusable module
that other apps can also use. Knowledge entries reference resources from
markdown via placeholder tokens (`{{resource:<uuid>}}`), no FK.

## Roadmap

| #   | Step                                                                                  | Status  |
| --- | ------------------------------------------------------------------------------------- | ------- |
| 1   | Tags admin                                                                            | ✅ done |
| 2   | Decouple resources + standalone Resources module                                      | ✅ done |
| 3   | Knowledge entry create/edit (form: q, summary, markdown, tag picker, resource picker) | ⏳ next |
| 4   | Overview list + detail view; resolve placeholders to signed Storage URLs              | —       |
| 5   | Filter overview by topic + concept tags                                               | —       |
| 6   | Full-text search + fuzzy typeahead (`search_vector` + `pg_trgm`)                      | —       |

## Step 1 — Tags Admin (done)

Route: `/apps/knowledge-base/tags`. Hub at `/apps/knowledge-base` is a
temporary tile page; will be replaced by the overview in step 4.

- **Schema** (already in `20260508151555_remote_schema.sql`):
  `tags(id, name UNIQUE, type tag_type)`, enum `topic | concept`
- **Files**: `tags/api.ts` (CRUD + `DuplicateTagError`), `TagSection.tsx`,
  `TagRow.tsx`, `page.tsx` (auth-gated, splits by type)
- **UI**: pill-style chips, click-to-rename (Enter / Esc / blur), inline
  delete with confirm
- **Seed**: 5 topics + 5 concepts in `supabase/seed.sql`
- **Tests**: 25 (api 11, TagRow 9, TagSection 5)
- **Hub entry**: added Knowledge Base card to `/apps`
- **CLAUDE.md**: updated

## Step 2 — Resources Module (done)

Route: `/resources` (top-level utility, accessible from sidebar + KB hub
tile). Standalone so any future app can reuse it.

- **Migration** `20260511000000_decouple_resources_storage.sql`:
  - Dropped `resources.knowledge_id` + FK + index
  - Added `size_bytes`, `created_at` + `idx_resources_created_at`
  - Created private storage bucket `resources` (renamed from initial
    `knowledge` after realising it was app-specific)
  - Added RLS policies on `storage.objects` for `bucket_id='resources'`
- **Files**: `resources/api.ts` (`listResources`, `uploadResource` with
  filename sanitization + rollback on metadata failure, `renameResource`,
  `deleteResource`, `getSignedUrl` 1h TTL, `placeholderToken`, `UploadError`),
  `UploadDropzone.tsx` (drag+drop or click, parallel uploads, per-file
  errors), `ResourceCard.tsx` (preview via signed URL for image/video, mime
  badge otherwise, inline rename, copy-token, delete with confirm),
  `ResourceGrid.tsx`, `page.tsx`
- **Token syntax**: `{{resource:<uuid>}}` — copied to clipboard from each
  card with a 1.5s "Copied!" feedback
- **Auth**: any authenticated user (matches RLS)
- **Sidebar**: added "Tools → Resources" + Knowledge Base entry under Apps
- **Tests**: 26 (api 14 incl. `sanitizeFilename` + `placeholderToken`,
  ResourceCard 8, UploadDropzone 3, listResources 1)
- **CLAUDE.md**: updated

### Local dev seeding

- Files placed in `supabase/seed-files/` (dir tracked via `.gitkeep`,
  contents ignored) get uploaded automatically on `pnpm supabase:reset`
- `scripts/seed-resources.mjs` reads `supabase status -o env` for API URL +
  service role key, uploads each file + inserts the row
- Skips silently when empty; never blocks the reset (always exits 0)
- Standalone: `pnpm seed:resources`

### Cleanup along the way

- `.gitignore`: added `*.tsbuildinfo` + untracked the accidentally committed
  `tsconfig.tsbuildinfo`
- `.gitignore`: added `supabase/seed-files/*` with `.gitkeep` exception

## Step 3 — Knowledge Entry Create/Edit (next)

Route TBD (likely `/apps/knowledge-base/create` + `/apps/knowledge-base/<id>`
for edit). Form fields:

- Question (text, required)
- Summary (textarea, 1–2 sentences, required)
- Detail (markdown textarea, optional)
- Tag picker — topics + concepts, multi-select from existing tags
- Resource picker — reuses `<ResourcePicker />` (to be extracted from
  `ResourceGrid`) to insert `{{resource:<uuid>}}` tokens into the detail

Inserts into `public.knowledge` (trigger updates `search_vector`) +
`public.knowledge_tags` join rows.

## Step 4 — Overview + Detail (later)

- Overview list at `/apps/knowledge-base` (replaces the temporary hub)
- Detail view at `/apps/knowledge-base/<id>`
- Markdown renderer resolves `{{resource:<uuid>}}` to signed Storage URLs at
  render time (lookup by `resources.id`)

## Step 5 — Tag Filters (later)

- Reuse `PillFilter` for topic + concept filters on overview
- Multi-select; AND across tag categories, OR within a category (TBD)

## Step 6 — Full-text Search (later)

- Typeahead input on overview
- Backend: combine `search_vector` (GIN, ts_rank) with `pg_trgm` similarity
  for typo tolerance on `question` + `summary`
- Debounce on the client; cap results

## Open questions

- (Step 3) Markdown editor — plain textarea + preview, or a richer component?
- (Step 3) Resource picker UX — modal, inline grid, or autocomplete by label?
- (Step 5) Tag filter combinator semantics (AND/OR)
- (Step 6) Search debounce + result cap
