import { getSupabase } from "@/lib/supabase/client";
import type { HabitDetail } from "@/lib/supabase/types";

export async function getHabitById(id: number): Promise<HabitDetail | null> {
  const { data, error } = await getSupabase()
    .from("habit")
    .select(
      "id, note, completed_at, created_at, action(id, name, description, type, level)"
    )
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }
  return data as HabitDetail;
}
