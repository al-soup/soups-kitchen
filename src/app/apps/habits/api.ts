import { getSupabase } from "@/lib/supabase/client";
import type {
  ActionCount,
  ActionType,
  GetDailyHabitScoresParams,
  HabitDetail,
  HabitFeedPage,
  HabitSort,
  ScoresByType,
} from "@/lib/supabase/types";

export const PAGE_SIZE = 20;

export async function getHabitFeed({
  actionTypes,
  actionId,
  sort = "desc",
  offset,
  date,
  signal,
}: {
  actionTypes: ActionType[];
  actionId?: number | null;
  sort?: HabitSort;
  offset: number;
  date?: string | null;
  signal?: AbortSignal;
}): Promise<HabitFeedPage> {
  let query = getSupabase()
    .from("habit")
    .select(
      "id, note, completed_at, created_at, action!inner(id, name, description, type, level)"
    )
    .in("action.type", actionTypes)
    .not("completed_at", "is", null);

  if (actionId != null) {
    query = query.eq("action_id", actionId);
  }

  if (date) {
    query = query
      .gte("completed_at", `${date}T00:00:00`)
      .lt("completed_at", `${date}T24:00:00`);
  }

  const orderedQuery = query
    .order("completed_at", { ascending: sort === "asc", nullsFirst: false })
    .range(offset, offset + PAGE_SIZE);

  const { data, error } = await (signal
    ? orderedQuery.abortSignal(signal)
    : orderedQuery);

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as HabitDetail[];
  return {
    items: rows.slice(0, PAGE_SIZE),
    hasMore: rows.length > PAGE_SIZE,
  };
}

export async function getDailyHabitScores(params: GetDailyHabitScoresParams) {
  const { data, error } = await getSupabase().rpc(
    "get_daily_habit_scores",
    params
  );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/** One RPC call per type; the RPC only knows a single `action_type`. */
export async function getDailyHabitScoresByType(
  types: ActionType[],
  startDate: string,
  actionId?: number | null
): Promise<ScoresByType> {
  const results = await Promise.all(
    types.map((t) =>
      getDailyHabitScores({
        action_type: t,
        start_date: startDate,
        ...(actionId != null ? { filter_action_id: actionId } : {}),
      })
    )
  );
  const byType: ScoresByType = {};
  types.forEach((t, i) => {
    byType[t] = results[i];
  });
  return byType;
}

/** Actions of the given types with their habit count, optionally since a date. */
export async function getActionCounts({
  actionTypes,
  since,
  signal,
}: {
  actionTypes: ActionType[];
  since?: string;
  signal?: AbortSignal;
}): Promise<ActionCount[]> {
  let query = getSupabase()
    .from("action")
    .select("id, name, description, type, level, habit(count)")
    .in("type", actionTypes)
    .order("level")
    .order("name");

  if (since) {
    query = query.gte("habit.completed_at", since);
  }

  const { data, error } = await (signal ? query.abortSignal(signal) : query);
  if (error) throw new Error(error.message);

  return (data ?? []).map(({ habit, ...action }) => ({
    ...(action as ActionCount),
    habitCount: habit[0]?.count ?? 0,
  }));
}
