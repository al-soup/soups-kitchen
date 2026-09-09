-- Add an explicit sort mode to search_knowledge so the KB list can offer
-- Newest / Oldest / By topic, and expose the grouping key + per-group size so
-- the grid can render topic headers without a second round-trip.
--
-- Sorting has to live here rather than client-side: the list is server
-- paginated (limit + 1 over-fetch, infinite scroll), so ordering a page's worth
-- of rows in the browser would only sort within a page.
--
-- topic_name is the entry's primary topic = alphabetically first tag of type
-- 'topic'. That matches what the card already renders: tags are aggregated
-- `order by t.name` and the card picks the first `type = 'topic'`.
--
-- Relevance ranking applies only in the default 'newest' mode. 'oldest' and
-- 'topic' are explicit user overrides, so the q ranking term is dropped there.
--
-- Drop the previous 5-arg signature first because the return type changes.

drop function if exists
  public.search_knowledge(uuid[], uuid[], text, int, int);

create or replace function public.search_knowledge(
  topic_ids uuid[] default null,
  concept_ids uuid[] default null,
  q text default null,
  p_offset int default 0,
  p_limit int default 20,
  p_sort text default 'newest'
)
returns table (
  id bigint,
  question text,
  summary text,
  detail text,
  search_vector tsvector,
  created_at timestamptz,
  updated_at timestamptz,
  tags json,
  topic_name text,
  total_count bigint,
  group_count bigint
)
language sql
stable
-- Inlines the trigram threshold (0.2) via explicit word_similarity() > 0.2
-- comparisons instead of `set pg_trgm.word_similarity_threshold` + `<%`,
-- because hosted Supabase forbids non-superusers from setting that GUC in a
-- function definition (SQLSTATE 42501).
as $$
  with query as (
    select
      nullif(btrim(q), '') as q,
      case
        when nullif(btrim(q), '') is not null
        then plainto_tsquery('english', nullif(btrim(q), ''))
        else null
      end as tsq
  ),
  base as (
    select
      k.id, k.question, k.summary, k.detail, k.search_vector,
      k.created_at, k.updated_at,
      coalesce(
        (select json_agg(
           json_build_object('id', t.id, 'name', t.name, 'type', t.type)
           order by t.name
         )
         from public.knowledge_tags kt
         join public.tags t on t.id = kt.tag_id
         where kt.knowledge_id = k.id),
        '[]'::json
      ) as tags,
      (select min(t.name)
       from public.knowledge_tags kt
       join public.tags t on t.id = kt.tag_id
       where kt.knowledge_id = k.id and t.type = 'topic') as topic_name,
      case
        when query.q is null then 0
        else ts_rank(k.search_vector, query.tsq)
             + greatest(word_similarity(query.q, k.question),
                        word_similarity(query.q, k.summary))
      end as relevance
    from public.knowledge k
    cross join query
    where (
      topic_ids is null or cardinality(topic_ids) = 0
      or exists (
        select 1 from public.knowledge_tags kt
        where kt.knowledge_id = k.id and kt.tag_id = any(topic_ids)
      )
    )
    and (
      concept_ids is null or cardinality(concept_ids) = 0
      or exists (
        select 1 from public.knowledge_tags kt
        where kt.knowledge_id = k.id and kt.tag_id = any(concept_ids)
      )
    )
    and (
      query.q is null
      or k.search_vector @@ query.tsq
      or word_similarity(query.q, k.question) > 0.2
      or word_similarity(query.q, k.summary) > 0.2
    )
  )
  -- Both window counts are computed over the full filtered set, before
  -- OFFSET/LIMIT, so they stay stable while paging.
  select
    b.id, b.question, b.summary, b.detail, b.search_vector,
    b.created_at, b.updated_at, b.tags, b.topic_name,
    count(*) over () as total_count,
    count(*) over (partition by b.topic_name) as group_count
  from base b
  order by
    case when p_sort = 'topic' then b.topic_name end asc nulls last,
    case when p_sort = 'oldest' then b.created_at end asc,
    case when p_sort not in ('topic', 'oldest') then b.relevance end desc,
    b.created_at desc
  offset p_offset
  limit p_limit + 1;
$$;

grant execute on function
  public.search_knowledge(uuid[], uuid[], text, int, int, text)
  to anon, authenticated;
