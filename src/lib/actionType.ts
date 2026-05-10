import type { ActionType } from "./supabase/types";

const TYPE_PARAM = "type";

export function parseActionType(raw: string | null): ActionType | null {
  if (raw === "1" || raw === "2" || raw === "3") {
    return Number(raw) as ActionType;
  }
  return null;
}

export function actionTypeQuery(type: ActionType): string {
  return `?${TYPE_PARAM}=${type}`;
}

export { TYPE_PARAM };
