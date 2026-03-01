import type { Database, Tables } from "./database.types";

type Functions = Database["public"]["Functions"];

export type DailyHabitScore =
  Functions["get_daily_habit_scores"]["Returns"][number];

export type GetDailyHabitScoresParams = {
  action_type: ActionType;
  start_date: string;
};

export type ActionType = 1 | 2 | 3;

export type Action = Pick<
  Tables<"action">,
  "id" | "name" | "description" | "level"
> & {
  type: ActionType;
};

export type HabitDetail = Pick<
  Tables<"habit">,
  "id" | "note" | "completed_at" | "created_at"
> & {
  action: Action;
};

export type HabitFeedPage = {
  items: HabitDetail[];
  hasMore: boolean;
};
