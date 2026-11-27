import { getSupabase } from "@/lib/supabase/client";
import type { Action } from "@/lib/supabase/types";

// Yearly Laboratorium membership fee in CHF.
const YEARLY_PRICES: Record<number, number> = { 2026: 170, 2027: 1000 };

type HabitRow = {
  action_id: number;
  note: string | null;
  completed_at: string;
};

function isLabVisit(action: Pick<Action, "name" | "type">): boolean {
  return (
    action.type === 1 && (action.name?.startsWith("Laboratorium") ?? false)
  );
}

function yearlyPrice(year: number): number {
  const years = Object.keys(YEARLY_PRICES).map(Number);
  const known = years.filter((y) => y <= year);
  const pick = known.length ? Math.max(...known) : Math.max(...years);
  return YEARLY_PRICES[pick];
}

function labVisitNote(visit: number, year: number): string {
  const cost = (yearlyPrice(year) / visit).toFixed(2);
  return `Besuch ${visit}: ${cost} CHF`;
}

async function countVisitsInYear(
  actionId: number,
  completedAt: string
): Promise<number> {
  const year = completedAt.slice(0, 4);
  const { count, error } = await getSupabase()
    .from("habit")
    .select("id", { count: "exact", head: true })
    .eq("action_id", actionId)
    .gte("completed_at", `${year}-01-01T00:00:00`)
    .lte("completed_at", completedAt);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

/** Appends "Besuch <n>: <cost> CHF" to every Lab Visit row's note. */
export async function withLabVisitNotes(
  rows: HabitRow[],
  actions: Action[]
): Promise<HabitRow[]> {
  const labIds = new Set(actions.filter(isLabVisit).map((a) => a.id));
  return Promise.all(
    rows.map(async (row) => {
      if (!labIds.has(row.action_id)) return row;
      const visit =
        (await countVisitsInYear(row.action_id, row.completed_at)) + 1;
      const line = labVisitNote(visit, Number(row.completed_at.slice(0, 4)));
      return { ...row, note: row.note ? `${row.note}\n${line}` : line };
    })
  );
}
