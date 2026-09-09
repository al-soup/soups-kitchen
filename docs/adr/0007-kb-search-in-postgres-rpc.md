# KB list = one RPC: tsvector + trigram, filters and paging in SQL

The Knowledge Base list is served by the `search_knowledge` RPC, which
combines a `search_vector` tsvector match with pg*trgm `word_similarity`
(threshold 0.2) for typo tolerance, applies tag filters, and paginates
(limit + 1 over-fetch for infinite scroll). Because pages are cut in SQL,
anything that affects ordering or grouping must live in the RPC too; sorting a
page's worth of rows in the browser only sorts within that page. Tag filters
are URL-driven by tag \_name* (repeated params) so links stay readable.

Considered options: PostgREST filters + client-side ranking (no fuzzy match,
no global order), an external search service (overkill for a few hundred
entries).
