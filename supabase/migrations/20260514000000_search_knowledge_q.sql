-- Extend search_knowledge with a free-text query parameter.
-- FTS via search_vector (GIN) + pg_trgm similarity on question/summary for
-- typo tolerance. Ranking: ts_rank + max(trigram similarity) when q is set;
-- reverse-chrono otherwise. Composes with topic_ids / concept_ids (AND
-- across all three filter dimensions).
--
-- The previous 4-arg signature is dropped so PostgREST resolves to the new
-- 5-arg overload unambiguously.

drop function if exists
  public.search_knowledge(uuid[], uuid[], int, int);

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
  tags json
)
language sql
stable
-- word_similarity_threshold default 0.6 is too strict for short typos;
-- 0.2 catches typos like "inexing" -> "index" while still rejecting
-- unrelated words. The relevance ranking pushes correct matches to the top.
-- Local to this function so we don't affect other queries.
set pg_trgm.word_similarity_threshold = 0.2
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
    ) as tags
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
    or query.q <% k.question
    or query.q <% k.summary
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
  public.search_knowledge(uuid[], uuid[], text, int, int) to authenticated;
