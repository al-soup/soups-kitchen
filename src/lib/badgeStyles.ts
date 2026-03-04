import type { ActionType } from "@/lib/supabase/types";

export function getBadgeStyle(type: ActionType, level: number) {
  const prefix = type === 2 ? "t2-" : type === 3 ? "t3-" : "";
  return {
    background: `var(--habit-score-${prefix}level-${level})`,
    color: "var(--foreground)",
    borderColor: "transparent",
  };
}
