import { getSupabase } from "@/lib/supabase/client";
import type { Action } from "@/lib/supabase/types";
import { getCachedActions, setCachedActions } from "@/lib/actionsCache";

export async function getActions(): Promise<Action[]> {
  const cached = getCachedActions();
  if (cached) return cached;

  const { data, error } = await getSupabase()
    .from("action")
    .select("id, name, description, type, level")
    .order("level");

  if (error) throw new Error(error.message);

  const actions = (data ?? []) as Action[];
  setCachedActions(actions);
  return actions;
}

type HabitRow = {
  action_id: number;
  note: string | null;
  completed_at: string;
};

export async function createHabits(rows: HabitRow[]): Promise<number[]> {
  const { data, error } = await getSupabase()
    .from("habit")
    .insert(rows)
    .select("id");
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => r.id);
}
