-- Optional single-action filter for the Score Graph. The old signature is
-- dropped first: keeping both overloads would leave PostgREST unable to pick
-- one for a two-argument call.
DROP FUNCTION IF EXISTS public.get_daily_habit_scores(integer, date);

-- The parameter is not called `action_id`: inside a SQL function an unqualified
-- name resolves to habit.action_id before the parameter.
CREATE OR REPLACE FUNCTION public.get_daily_habit_scores(
  action_type integer,
  start_date date DEFAULT CURRENT_DATE,
  filter_action_id bigint DEFAULT NULL
)
 RETURNS TABLE(completed_date date, habit_ids integer[], total_score numeric)
 LANGUAGE sql
 STABLE
AS $function$select
    date_trunc('day', h.completed_at)::date as completed_date,
    array_agg(distinct h.id::int) as habit_ids,
    sum(a.level) as total_score
  from
    habit as h
    join action as a on a.id = h.action_id
      and a.type = action_type
  where
    h.completed_at is not null
    and (filter_action_id is null or h.action_id = filter_action_id)
    and h.completed_at < (start_date + interval '1 day')::date
    and h.completed_at >= (start_date - interval '1 year')::date
  group by
    completed_date
  order by
    completed_date
  limit 365;$function$
;

GRANT EXECUTE ON FUNCTION public.get_daily_habit_scores(integer, date, bigint) TO anon, authenticated, service_role;
