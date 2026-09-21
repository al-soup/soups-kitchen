import type { ActionType } from "@/lib/supabase/types";

/** Score levels above 6 share the darkest ramp step. */
export const MAX_SCORE_LEVEL = 6;

export function habitScoreColor(type: ActionType, level: number): string {
  const clamped = Math.min(Math.max(level, 0), MAX_SCORE_LEVEL);
  // Level 0 is the shared "empty" colour; only levels 1-6 have per-type ramps.
  if (clamped === 0) return "var(--habit-score-level-0)";
  const prefix = type === 2 ? "t2-" : type === 3 ? "t3-" : "";
  return `var(--habit-score-${prefix}level-${clamped})`;
}

export function getBadgeStyle(type: ActionType, level: number) {
  return {
    background: habitScoreColor(type, level),
    color: "var(--foreground)",
    borderColor: "transparent",
  };
}
