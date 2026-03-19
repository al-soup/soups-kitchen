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

export async function updateHabit(
  id: number,
  fields: { note: string; completed_at: string }
): Promise<void> {
  const { error } = await getSupabase()
    .from("habit")
    .update(fields)
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteHabit(id: number): Promise<void> {
  const { error } = await getSupabase()
    .from("habit")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}
