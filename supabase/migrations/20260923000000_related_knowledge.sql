-- Entries sharing tags with p_id, for the "Related" block on the detail page
-- (issue #52). A shared concept counts double: concepts are the narrower
-- signal, one topic alone matches most of the KB.

create or replace function public.related_knowledge(
  p_id bigint,
  p_limit int default 4
)
returns table (
  id bigint,
  question text,
  tags json,
  topic_name text
)
language sql
stable
as $$
  with shared as (
    select
      other.knowledge_id,
      sum(case when t.type = 'concept' then 2 else 1 end) as weight
    from public.knowledge_tags mine
    join public.knowledge_tags other
      on other.tag_id = mine.tag_id
     and other.knowledge_id <> mine.knowledge_id
    join public.tags t on t.id = mine.tag_id
    where mine.knowledge_id = p_id
    group by other.knowledge_id
  )
  select
    k.id,
    k.question,
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
     where kt.knowledge_id = k.id and t.type = 'topic') as topic_name
  from shared s
  join public.knowledge k on k.id = s.knowledge_id
  order by s.weight desc, k.created_at desc
  limit p_limit;
$$;

grant execute on function public.related_knowledge(bigint, int)
  to anon, authenticated;
