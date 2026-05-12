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
| 3   | Knowledge entry create/edit (form: q, summary, markdown, tag picker, resource picker) | ✅ done |
| 4   | Overview list + detail view; resolve placeholders to signed Storage URLs              | ✅ done |
| 5   | Filter overview by topic + concept tags                                               | ⏳ next |
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

## Step 3 — Knowledge Entry Create/Edit (done)

Routes: `/apps/knowledge-base/create` (new) and
`/apps/knowledge-base/[id]/edit` (edit). KB hub's "Create entry" tile now
links to `/create`.

- **Shared form** in private folder `_form/` (Next.js ignores `_*` for
  routing; importable by both pages):
  - `KnowledgeForm.tsx` — question (required), summary (required textarea),
    detail (markdown textarea, optional), tag picker, "Insert resource" button
  - `TagPicker.tsx` — single search filters both lists simultaneously;
    `<details open>` collapsible sections; pills filled = selected, outlined
    = unselected; topics use `--color-primary`, concepts use `--color-secondary`;
    `+ Topic` / `+ Concept` buttons appear when the search query has no exact
    match (calls `createTag` from `tags/api.ts`)
  - `ResourcePickerModal.tsx` — opens on "Insert resource"; modal grid of
    resource tiles with image preview via signed URL; filter input; click a
    tile → inserts `{{resource:<uuid>}}` at the textarea cursor
- **API** (`_form/api.ts`):
  - `createKnowledge({ question, summary, detail, tagIds })` — inserts
    `public.knowledge` row (trigger updates `search_vector`), then bulk
    inserts `public.knowledge_tags`; rolls back the entry on tag insert
    failure
  - `updateKnowledge(id, ...)` — updates entry + replaces tags
    (delete-all-then-insert via `setKnowledgeTags`)
  - `getKnowledge(id)` — fetches entry + its tag ids for the edit page
- **Markdown rendering**: deferred to step 4. Detail is stored verbatim;
  tokens are not resolved yet.
- **Edit-page UX**:
  - Stays on the page after save (no redirect); `KnowledgeForm` tracks a
    `committed` snapshot, computes `isDirty`, disables submit until something
    actually changes, and shows a brief "Saved." flash in a reserved status
    row (so the Delete button doesn't shift)
  - **Delete** button (red outline → red filled on hover) on the edit page;
    confirm dialog; on success → `router.push("/apps/knowledge-base")`
  - **Not-found**: `getKnowledge` throws `NotFoundError` for Postgres
    `PGRST116` (no row) and `22P02` (invalid UUID); page renders an "Entry
    not found" state with the id and a back link
- **Form polish (after first pass)**:
  - "Insert resource" moved below the detail textarea (less label clutter)
  - TagPicker create-buttons live in the search row, split 50/50 with the
    input; `Create "<query>" as + Topic + Concept` fades in 400ms after the
    query stabilises and is ≥ 2 chars (with no exact match)
  - Resource modal results area has `min-height: 180px` so filtering
    doesn't collapse the layout
- **Auth**: any authenticated user (matches RLS)
- **Tests**: 26 (api 9 incl. `NotFoundError` + `deleteKnowledge`, TagPicker
  8, ResourcePickerModal 5, plus 4 KB integration cases)
- **Hub**: Create entry tile activated
- **CLAUDE.md**: updated

## Step 4 — Overview + Detail (done)

Routes: overview at `/apps/knowledge-base` (replaces temporary hub) and a
single detail route at `/apps/knowledge-base/<id>` that toggles between
**Preview** and **Edit** (no separate `/edit` route).

- **Schema swap** in
  `20260512000000_knowledge_bigserial_id.sql`: `knowledge.id` is now
  `bigserial` (URLs like `/apps/knowledge-base/3` instead of UUID).
  `knowledge_tags` recreated with `bigint knowledge_id`; 3 RLS policies
  recreated. `pnpm supabase:types` regenerated `Knowledge.id` to `number`.
- **API** (`_form/api.ts`): id parameters swapped `string` → `number`. New
  `listKnowledge({ offset, limit })` selects `knowledge` with nested
  `knowledge_tags(tag:tags(*))`, ordered `created_at desc`. Fetches
  `limit + 1` rows to derive `hasMore`. Returns each row shaped as
  `KnowledgeListItem = Knowledge & { tags: Tag[] }`.
- **Resources batch helpers** (`src/app/resources/api.ts`):
  - `listResourcesByIds(ids)` — single `.in("id", ids)` query
  - `getSignedUrlsByIds(ids)` — returns `Record<id, { url, mime, filename }>`;
    parallel `createSignedUrl` (1h TTL); missing rows → `url: null`
- **Markdown**: added `react-markdown` + `remark-gfm`.
  - `resolveResourceTokens.ts` — regex extract `/\{\{resource:([0-9a-f-]{36})\}\}/g`;
    image mime → `![filename](url)`, else `[filename](url)`, missing →
    `~~missing resource~~`
  - `MarkdownDetail.tsx` — thin `<ReactMarkdown>` wrapper with `skipHtml`
    and `target="_blank"` for links; theme-aware CSS module covers headings,
    lists, code, tables, blockquotes, images, hr
- **Overview** (`page.tsx`): client component; auth-gate; top toolbar with
  "+ New entry", "Tags", "Resources" pills; **compact** card grid
  (question + `<TagBreadcrumb>` + date only — answers hidden for later
  revision mode). Load-more pagination (page size 20); empty + error states.
- **Shared bits** in `_form/`:
  - `TagBreadcrumb.tsx` — uppercase letter-spaced topics in
    `--color-primary`, heavy chevron `❯` separator, concepts in
    `--color-secondary`, middot `·` between siblings. `size="sm"` for
    cards, `size="md"` for the detail page.
  - `format.ts` — `formatDate("12. May 2026")` and
    `formatDateTime("12. May 2026, 14:30")` (24h). Used by both the card
    date stamp and the detail-page footer (Created uses date, Updated uses
    datetime).
- **Detail + Edit** (`[id]/page.tsx`): single route per entry. Header is
  back arrow (button — confirms when dirty) + question + Pencil/Eye toggle
  button.
  - **Lifted draft state**: page owns `draft` + `committed`; preview
    reflects the draft (so in-progress edits are visible without saving).
    `isDraftDirty` extracted to `_form/types.ts` and used both here and by
    `KnowledgeForm`.
  - **KnowledgeFields** (`_form/KnowledgeFields.tsx`): controlled-fields
    component (`value` + `onChange`) containing question/summary/detail
    inputs, TagPicker, ResourcePickerModal. `KnowledgeForm` is now a thin
    uncontrolled wrapper around it for the create page.
  - **Action bar** with Cancel · Save · Delete is rendered when `isDirty`
    or in edit mode. Cancel reverts the draft (confirm if dirty); Save
    posts and refreshes the committed baseline (also flips the "Saved."
    flash); Delete confirms then navigates to overview.
  - **Dirty guard**: `beforeunload` listener prevents accidental tab
    close/refresh while dirty; back arrow uses a `confirm()` before
    `router.push`.
  - Resource-token resolution effect now keys on `draft.detail` so the
    preview matches what the user just typed.
  - Preview footer: muted `Created … · Updated …` (Updated omitted when
    equal to Created).
  - Mode toggle uses new `PencilIcon` / `EyeIcon` from `src/constants/icons.tsx`
    (registered in `/dev/icons`).
- **Seed**: 5 entries added to `supabase/seed.sql` (B-tree index,
  optimistic/pessimistic concurrency, cache-aside antipattern, 401 vs 403,
  hash-map worst case). CTE captures inserted ids by question text and
  bulk-inserts tag links via a `CASE` lookup.
- **Tests**: 161 total (+15: listKnowledge 3, resolveResourceTokens 7,
  resource batch helpers 5; plus updated id types across the api suite).
- **CLAUDE.md**: file structure + apps line updated.

## Step 5 — Tag Filters (next)

- Reuse `PillFilter` for topic + concept filters on overview
- Multi-select; AND across tag categories, OR within a category (TBD)

## Step 6 — Full-text Search (later)

- Typeahead input on overview
- Backend: combine `search_vector` (GIN, ts_rank) with `pg_trgm` similarity
  for typo tolerance on `question` + `summary`
- Debounce on the client; cap results

## Open questions

- (Step 5) Tag filter combinator semantics (AND across categories, OR
  within?)
- (Step 6) Search debounce + result cap

### Resolved in step 3

- Markdown editor → plain textarea; preview deferred to step 4
- Resource picker UX → modal grid with filter input

### Resolved in step 4

- Markdown renderer → `react-markdown` + `remark-gfm`; tokens
  resolved by pre-processing the string before render
- Signed URLs generated per-detail-page render (overview only shows
  summaries so no resolution needed there). No cross-page cache for now —
  add only if it becomes a bottleneck
- `knowledge.id` → `bigserial` (recommended; nicer URLs, low cost pre-data)
