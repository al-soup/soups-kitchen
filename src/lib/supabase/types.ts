import type { Database, Tables } from "./database.types";

type Functions = Database["public"]["Functions"];

export type Tag = Tables<"tags">;
export type TagType = Database["public"]["Enums"]["tag_type"];

export type Resource = Tables<"resources">;

export type Question = Tables<"questions">;

export type Knowledge = Tables<"knowledge">;
export type KnowledgeTag = Tables<"knowledge_tags">;

export type KnowledgeListItem = Knowledge & { tags: Tag[] };

export type KnowledgeListPage = {
  items: KnowledgeListItem[];
  hasMore: boolean;
  total: number;
};

export const RESOURCES_BUCKET = "resources";

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
