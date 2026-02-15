import { getSupabase } from "@/lib/supabase/client";
import type { GetDailyHabitScoresParams } from "@/lib/supabase/types";

export async function getDailyHabitScores(params: GetDailyHabitScoresParams) {
  const { data, error } = await getSupabase().rpc(
    "get_daily_habit_scores",
    params,
  );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
