import { getSupabase } from "@/lib/supabase/client";
import type {
  ActionType,
  GetDailyHabitScoresParams,
  HabitDetail,
  HabitFeedPage,
  ScoresByType,
} from "@/lib/supabase/types";

export const PAGE_SIZE = 20;

export async function getHabitFeed({
  actionTypes,
  offset,
  date,
  signal,
}: {
  actionTypes: ActionType[];
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

  if (date) {
    query = query
      .gte("completed_at", `${date}T00:00:00`)
      .lt("completed_at", `${date}T24:00:00`);
  }

  const orderedQuery = query
    .order("completed_at", { ascending: false, nullsFirst: false })
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
  startDate: string
): Promise<ScoresByType> {
  const results = await Promise.all(
    types.map((t) =>
      getDailyHabitScores({ action_type: t, start_date: startDate })
    )
  );
  const byType: ScoresByType = {};
  types.forEach((t, i) => {
    byType[t] = results[i];
  });
  return byType;
}
