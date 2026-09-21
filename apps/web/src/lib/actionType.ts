import type { ActionType } from "./supabase/types";

const TYPE_PARAM = "type";
const ALL_TYPES = "all";

/** A single Action Type or the combined view of every visible type. */
export type ActionTypeFilter = ActionType | typeof ALL_TYPES;

export const ACTION_TYPES: { value: ActionType; label: string }[] = [
  { value: 1, label: "Sports" },
  { value: 2, label: "Bad Habits" },
  { value: 3, label: "Learning" },
];

export function actionTypeLabel(type: ActionType): string {
  return ACTION_TYPES.find((t) => t.value === type)?.label ?? `Type ${type}`;
}

export function parseActionType(raw: string | null): ActionType | null {
  if (raw === "1" || raw === "2" || raw === "3") {
    return Number(raw) as ActionType;
  }
  return null;
}

export function parseActionTypeFilter(
  raw: string | null
): ActionTypeFilter | null {
  if (raw === ALL_TYPES) return ALL_TYPES;
  return parseActionType(raw);
}

export function actionTypeQuery(type: ActionTypeFilter): string {
  return `?${TYPE_PARAM}=${type}`;
}

/** Concrete types behind a filter; the combined view expands to `visible`. */
export function resolveActionTypes(
  filter: ActionTypeFilter,
  visible: ActionType[]
): ActionType[] {
  return filter === ALL_TYPES ? visible : [filter];
}

export { TYPE_PARAM, ALL_TYPES };
