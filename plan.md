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
| 5   | Filter overview by topic + concept tags                                               | ✅ done |
| 6   | Full-text search + fuzzy typeahead (`search_vector` + `pg_trgm`)                      | ✅ done |

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

## Step 5 — Tag Filters (done)

Routes unchanged. Overview at `/apps/knowledge-base` gains two
always-visible multi-select pill rows under the toolbar (Topics + Concepts),
driven by URL params and a Postgres RPC.

- **Combinator**: OR within a category, AND across categories.
- **RPC** `supabase/migrations/20260513000000_search_knowledge_rpc.sql` →
  `public.search_knowledge(topic_ids uuid[], concept_ids uuid[], p_offset
int, p_limit int)` returns `setof (knowledge + tags json)`. Tags are
  pre-joined as `json_agg(...)` so a single call yields the full
  `KnowledgeListItem` shape. `LIMIT p_limit + 1` preserves the existing
  `hasMore` pattern. Grants `execute` to `authenticated`.
- **API** (`_form/api.ts`): `listKnowledge` now calls
  `supabase.rpc("search_knowledge", …)`. Empty / undefined filter arrays
  become `undefined` (RPC treats `NULL` arrays as "no filter").
- **URL params** (`_form/filterParams.ts`): tag **names** (not ids) in
  repeated multi-value params, e.g.
  `?topics=Databases&topics=Networking&concepts=DB+Indexing`. Names are
  resolved client-side to ids via a `tagsByName` map built from the same
  `listTags()` result that powers the pill rows; unknown names silently drop.
  Helpers `buildKnowledgeQuery`, `toggleString`. Update via
  `router.replace(..., { scroll: false })`, mirroring the habits pattern.
- **Fetch sequencing**: when the URL has filter params, the knowledge fetch
  waits for `tagsLoaded` before firing — otherwise the first paint would
  briefly show all entries unfiltered while the tag map is still empty.
- **UI**:
  - `_form/TagPills.tsx` — presentational multi-select pill row (filled =
    selected, outlined = unselected, `aria-pressed`). Hidden when no tags of
    that variant exist.
  - `_form/pills.module.css` — standalone pill styles (copied from
    `TagPicker.module.css` — left intact to avoid invasive refactor).
  - Overview page wrapped in `<Suspense>` so it can use `useSearchParams`.
    Adds a `.filters` block with two `.filterRow`s (`Topics` + `Concepts`
    labels), a `Clear filters` button when any filter is active, and a
    distinct empty-state copy when filters yield zero rows.
  - Page sets `loading=true` inside the toggle handlers (not inside the
    effect) to keep `react-hooks/set-state-in-effect` happy.
  - Clear filters button sits in a fixed-height row (`.clearFiltersRow`,
    `min-height: 24px`) and uses `:disabled { opacity: 0 }` so the list
    below doesn't jump when filters are toggled on/off.
- **Tests**: 184 total (+5 from step 4): listKnowledge RPC arg shaping (4),
  `filterParams` helpers (10), `TagPills` toggle/render (4). Replaces the
  old PostgREST-join cases.
- **CLAUDE.md** updated; `_form/filterParams.ts` and `_form/TagPills.tsx`
  added to file structure.

## Step 6 — Full-text Search (done)

In-place search input above the toolbar at `/apps/knowledge-base`. Composes
with tag filters via the same `search_knowledge` RPC, which now accepts a
`q text` parameter.

- **RPC** `supabase/migrations/20260514000000_search_knowledge_q.sql`:
  - New 5-arg signature `(topic_ids uuid[], concept_ids uuid[], q text,
p_offset int, p_limit int)`. The old 4-arg signature is dropped so
    PostgREST resolves to the new overload unambiguously.
  - When `q is null` (or trimmed to empty), behavior matches step 5:
    reverse-chronological order, no text filter. When `q` is set, a row
    matches if `search_vector @@ plainto_tsquery('english', q)`
    OR `q <% question` OR `q <% summary` (word_similarity > threshold).
  - Order when `q` is set: `ts_rank(search_vector, tsq) +
greatest(word_similarity(q, question), word_similarity(q, summary))`
    DESC, tie-break `created_at` DESC.
  - Function-local `set pg_trgm.word_similarity_threshold = 0.2`. The
    default (0.6) was too strict for short typos; 0.2 catches
    `inexing → index` while keeping noise low. Relevance ranking pushes
    the right match to the top.
- **API** (`_form/api.ts`): `listKnowledge` now accepts `q?: string` and
  passes the trimmed value (or `undefined`) to the RPC.
- **URL state**: `?q=<text>` (single-value param). Composes with the
  step-5 `?topics=…&concepts=…` repeated params. Updated via
  `router.replace(..., { scroll: false })`.
- **filterParams** (`_form/filterParams.ts`): added `Q_PARAM` constant;
  `buildKnowledgeQuery` now takes a third `q` argument and trims before
  setting (empty/whitespace → omitted).
- **UI**:
  - New `_form/SearchBox.tsx` + `SearchBox.module.css` — a debounced
    text input (250ms default) with a search-icon prefix and an `×`
    clear button. Clear cancels the pending timer and fires the
    callback with `""` synchronously so the URL clears immediately.
  - Page reads `q = searchParams.get(Q_PARAM)?.trim()`. The SearchBox is
    keyed on `q` so URL-driven changes (back nav, bookmark) refresh the
    input value without violating the `set-state-in-effect` lint rule.
  - `hasFilters` now includes `q.length > 0`; "Clear filters" resets q
    too. A separate `hasTagFilters` guards the fetch-waits-for-tags
    gate so a query-only fetch doesn't wait unnecessarily.
  - Empty state: `No entries match "<q>".` when q is set,
    `No entries match the current filters.` for tag-only, original copy
    otherwise.
  - New `SearchIcon` + `XIcon` added to `src/constants/icons.tsx` and
    `/dev/icons`.
- **Tests**: 188 total (+4 from step 5): SearchBox debounce (5),
  filterParams q cases (4), listKnowledge q param cases (3).
- **CLAUDE.md** updated.

## Open questions

(none active)

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

### Resolved in step 5

- Combinator → **OR within, AND across**. Within a category, more pills
  broaden the result; across categories they narrow it (Gmail/Linear model)
- Backend → **Postgres RPC** (`search_knowledge`), not client-side intersect
  or PostgREST inner-join. Pagination stays correct; step 6 can extend the
  same function with a `q text` param + ranking
- UI → **two always-visible pill rows** under the toolbar (multi-select, no
  counts). `PillFilter` was rejected for this surface because it's
  single-select with counts — different shape, not worth merging
- State → **URL params** (`?topics=…&concepts=…`), matching the
  `useSearchParams` + `router.replace({ scroll: false })` pattern from the
  habits page
- URL identifier → **tag names**, not UUIDs. Shorter, human-readable,
  shareable. Names → ids resolved client-side from the already-fetched tag
  list; renaming a tag breaks any saved URLs, which is acceptable for a
  personal KB with few renames

### Resolved in step 6

- Search UX → **in-place list filter** above the toolbar. Same cards,
  same pagination, composes with tag filters. Floating typeahead dropdown
  rejected (cards are richer than a dropdown row can show)
- Ranking when `q` is set → **relevance, then date**.
  `ts_rank + greatest(word_similarity(q, question), word_similarity(q,
summary))` DESC, tie-break `created_at` DESC. `q` empty/null falls back
  to reverse-chrono
- Fuzzy matching → **pg_trgm `word_similarity`** (finds best matching
  substring) via `<%` operator, with function-local
  `set pg_trgm.word_similarity_threshold = 0.2`. The default 0.6 was too
  strict for short typos; 0.2 catches typos like `inexing → index` while
  the ranking still surfaces the correct match first
- Debounce → **250ms**, owned by the `SearchBox` component via a
  `setTimeout` ref (same shape as `StationSearch`). Clear (×) cancels the
  pending timer and fires the callback immediately
- URL state → **`?q=<text>`** single-value param, composes with
  `?topics=…&concepts=…`. Backspacing to empty / clicking × removes the
  param
