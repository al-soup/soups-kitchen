-- One call for every type of the combined view, and a count instead of the
-- id array nobody read. The old signature is dropped first: same name and
-- arity would leave PostgREST unable to pick an overload.
DROP FUNCTION IF EXISTS public.get_daily_habit_scores(integer, date, bigint);

-- The parameter is not called `action_id`: inside a SQL function an unqualified
-- name resolves to habit.action_id before the parameter.
CREATE OR REPLACE FUNCTION public.get_daily_habit_scores(
  action_types integer[],
  start_date date DEFAULT CURRENT_DATE,
  filter_action_id bigint DEFAULT NULL
)
 RETURNS TABLE(action_type integer, completed_date date, habit_count integer, total_score numeric)
 LANGUAGE sql
 STABLE
AS $function$select
    a.type as action_type,
    date_trunc('day', h.completed_at)::date as completed_date,
    count(distinct h.id)::int as habit_count,
    sum(a.level) as total_score
  from
    habit as h
    join action as a on a.id = h.action_id
      and a.type = any(action_types)
  where
    h.completed_at is not null
    and (filter_action_id is null or h.action_id = filter_action_id)
    and h.completed_at < (start_date + interval '1 day')::date
    and h.completed_at >= (start_date - interval '1 year')::date
  group by
    a.type, completed_date
  order by
    completed_date;$function$
;

GRANT EXECUTE ON FUNCTION public.get_daily_habit_scores(integer[], date, bigint) TO anon, authenticated, service_role;
