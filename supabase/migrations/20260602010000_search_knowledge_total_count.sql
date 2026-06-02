-- Extend search_knowledge with a total_count column so the KB list can show
-- "X of Y entries" without a second round-trip. Uses count(*) over () so the
-- count is computed against the full WHERE filter (before LIMIT/OFFSET) and
-- attached to every returned row.
--
-- Drop the previous 5-arg signature first because the return type changes.

drop function if exists
  public.search_knowledge(uuid[], uuid[], text, int, int);

create or replace function public.search_knowledge(
  topic_ids uuid[] default null,
  concept_ids uuid[] default null,
  q text default null,
  p_offset int default 0,
  p_limit int default 20
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
  total_count bigint
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
  )
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
    count(*) over () as total_count
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
  order by
    case
      when query.q is null then 0
      else ts_rank(k.search_vector, query.tsq)
           + greatest(word_similarity(query.q, k.question),
                      word_similarity(query.q, k.summary))
    end desc,
    k.created_at desc
  offset p_offset
  limit p_limit + 1;
$$;

grant execute on function
  public.search_knowledge(uuid[], uuid[], text, int, int) to anon, authenticated;
