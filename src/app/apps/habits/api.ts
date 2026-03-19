import { getSupabase } from "@/lib/supabase/client";
import type {
  ActionType,
  GetDailyHabitScoresParams,
  HabitDetail,
  HabitFeedPage,
} from "@/lib/supabase/types";

export const PAGE_SIZE = 20;

export async function getHabitFeed({
  actionType,
  offset,
  date,
}: {
  actionType: ActionType;
  offset: number;
  date?: string | null;
}): Promise<HabitFeedPage> {
  let query = getSupabase()
    .from("habit")
    .select(
      "id, note, completed_at, created_at, action!inner(id, name, description, type, level)"
    )
    .eq("action.type", actionType)
    .not("completed_at", "is", null);

  if (date) {
    query = query
      .gte("completed_at", `${date}T00:00:00`)
      .lt("completed_at", `${date}T24:00:00`);
  }

  const { data, error } = await query
    .order("completed_at", { ascending: false, nullsFirst: false })
    .range(offset, offset + PAGE_SIZE);

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
