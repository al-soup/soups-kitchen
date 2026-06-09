import { getSupabase } from "@/lib/supabase/client";
import type { Question } from "@/lib/supabase/types";

export async function listQuestions(): Promise<Question[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("is_active", true);
  if (error) throw new Error(error.message);
  return data ?? [];
}
