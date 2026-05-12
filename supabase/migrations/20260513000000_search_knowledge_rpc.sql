-- RPC for filtering knowledge entries by topic + concept tag ids.
-- Semantics: OR within a category, AND across categories. Empty / null arrays
-- mean "no filter for that category". Tags are returned pre-joined as JSON to
-- match the KnowledgeListItem shape with a single roundtrip. Step 6 (FTS) will
-- extend this function with a `q text` param + ranking.

create or replace function public.search_knowledge(
  topic_ids uuid[] default null,
  concept_ids uuid[] default null,
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
as $$
  select
    k.id,
    k.question,
    k.summary,
    k.detail,
    k.search_vector,
    k.created_at,
    k.updated_at,
    coalesce(
      (
        select json_agg(
          json_build_object('id', t.id, 'name', t.name, 'type', t.type)
          order by t.name
        )
        from public.knowledge_tags kt
        join public.tags t on t.id = kt.tag_id
        where kt.knowledge_id = k.id
      ),
      '[]'::json
    ) as tags
  from public.knowledge k
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
  order by k.created_at desc
  offset p_offset
  limit p_limit + 1;
$$;

grant execute on function public.search_knowledge(uuid[], uuid[], int, int) to authenticated;
