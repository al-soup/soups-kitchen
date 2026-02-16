import type { Database } from "./database.types";

type Functions = Database["public"]["Functions"];

export type DailyHabitScore =
  Functions["get_daily_habit_scores"]["Returns"][number];

export type GetDailyHabitScoresParams = {
  action_type: ActionType;
  start_date: string;
};

export type ActionType = 1 | 2 | 3;
