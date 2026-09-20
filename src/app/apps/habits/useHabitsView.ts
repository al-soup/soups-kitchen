"use client";

import { useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import type {
  ActionCount,
  ActionType,
  ScoresByType,
} from "@/lib/supabase/types";
import {
  ACTION_TYPES,
  parseActionTypeFilter,
  resolveActionTypes,
  TYPE_PARAM,
  type ActionTypeFilter,
} from "@/lib/actionType";
import { getLocalToday } from "@/lib/dateUtils";
import { getActionCounts, getDailyHabitScores } from "./api";
import { useCachedQuery } from "./queryCache";

/**
 * Type selection shared by the tracker and insights pages: role-gated type
 * list, the `?type=` filter and the concrete types it expands to.
 */
export function useHabitsView() {
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { role } = useUserRole("habit");
  const canManage = role === "admin" || role === "manager";
  const signedIn = user !== null;

  // Bad Habits stay off the public site; RLS does not hide them (ADR-0003).
  const visibleTypes = useMemo(
    () => ACTION_TYPES.filter((t) => signedIn || t.value !== 2),
    [signedIn]
  );

  const requested = parseActionTypeFilter(searchParams.get(TYPE_PARAM)) ?? 1;
  const typeFilter: ActionTypeFilter =
    requested === 2 && !signedIn ? 1 : requested;

  // Memoised on the joined key: `signedIn` resolving after mount must not
  // hand consumers a new array with the same contents (each one refetches).
  const typesKey = resolveActionTypes(
    typeFilter,
    visibleTypes.map((t) => t.value)
  ).join(",");
  const actionTypes = useMemo(
    () => typesKey.split(",").map(Number) as ActionType[],
    [typesKey]
  );

  // Reads wait for the session: the type list differs signed in vs out, so
  // fetching before it resolves costs a second round of requests.
  return {
    canManage,
    visibleTypes,
    typeFilter,
    actionTypes,
    ready: !authLoading,
  };
}

const NO_SCORES: ScoresByType = {};
const NO_COUNTS: ActionCount[] = [];

const NO_TYPES: ActionType[] = [];

/**
 * Daily scores of the past year for each given type, optionally of one
 * Action. `null` types = not ready yet, stays loading.
 */
export function useDailyHabitScores(
  types: ActionType[] | null,
  actionId: number | null = null
) {
  const today = getLocalToday();
  const key = types && `scores|${types.join(",")}|${actionId ?? ""}|${today}`;
  const fetcher = useCallback(
    () => getDailyHabitScores(types ?? NO_TYPES, today, actionId),
    [types, today, actionId]
  );
  const { data, loading, error } = useCachedQuery(key, fetcher);
  return { scores: data ?? NO_SCORES, loading, error };
}

/** Actions of the given types with their habit count, optionally since a date. */
export function useActionCounts(types: ActionType[] | null, since?: string) {
  const key = types && `counts|${types.join(",")}|${since ?? ""}`;
  const fetcher = useCallback(
    () => getActionCounts({ actionTypes: types ?? NO_TYPES, since }),
    [types, since]
  );
  const { data } = useCachedQuery(key, fetcher);
  return data ?? NO_COUNTS;
}
