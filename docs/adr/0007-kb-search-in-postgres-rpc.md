# 0007. KB list = one RPC: tsvector + trigram, filters and paging in SQL

Date: 2026-09-09

## Context

The Knowledge Base list needs full-text search that tolerates typos, tag filters, and infinite
scroll. PostgREST filters alone give no fuzzy matching and no global ordering across pages; an
external search service is overkill for a few hundred entries.

## Decision

The list is served by the `search_knowledge` RPC. It combines a `search_vector` tsvector match
with pg*trgm `word_similarity` (threshold 0.2), applies tag filters, and paginates with a
limit + 1 over-fetch so the client knows whether another page exists. Tag filters are URL-driven
by tag \_name* as repeated params.

## Consequences

- Pages are cut in SQL, so anything that affects ordering or grouping must live in the RPC;
  sorting in the browser only sorts within one page.
- Changing the return shape means dropping and recreating the function in a migration and
  regenerating `database.types.ts`.
- Filter URLs are readable and shareable but break if a tag is renamed.
