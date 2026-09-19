"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import type { ActionType, ScoresByType } from "@/lib/supabase/types";
import {
  ACTION_TYPES,
  parseActionTypeFilter,
  resolveActionTypes,
  TYPE_PARAM,
  type ActionTypeFilter,
} from "@/lib/actionType";
import { getLocalToday } from "@/lib/dateUtils";
import { getDailyHabitScoresByType } from "./api";

/**
 * Type selection shared by the tracker and insights pages: role-gated type
 * list, the `?type=` filter and the concrete types it expands to.
 */
export function useHabitsView() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
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

  const actionTypes = useMemo(
    () =>
      resolveActionTypes(
        typeFilter,
        visibleTypes.map((t) => t.value)
      ),
    [typeFilter, visibleTypes]
  );

  return { canManage, visibleTypes, typeFilter, actionTypes };
}

type ScoresResult = { key: string; scores: ScoresByType; error: string | null };
const NO_SCORES: ScoresByType = {};

/** Daily scores of the past year for each given type, optionally of one Action. */
export function useDailyHabitScores(
  types: ActionType[],
  actionId: number | null = null
) {
  const typesKey = `${types.join(",")}|${actionId ?? ""}`;
  // Keyed by the request so a stale result never shows for a newer selection.
  const [result, setResult] = useState<ScoresResult>({
    key: "",
    scores: NO_SCORES,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();
    getDailyHabitScoresByType(types, getLocalToday(), actionId)
      .then((scores) => {
        if (!controller.signal.aborted)
          setResult({ key: typesKey, scores, error: null });
      })
      .catch((err) => {
        if (!controller.signal.aborted)
          setResult({ key: typesKey, scores: NO_SCORES, error: err.message });
      });
    return () => controller.abort();
  }, [types, actionId, typesKey]);

  const loading = result.key !== typesKey;
  return {
    scores: loading ? NO_SCORES : result.scores,
    error: loading ? null : result.error,
    loading,
  };
}
