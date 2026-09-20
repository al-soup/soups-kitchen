"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PageTitle } from "@/components/ui/PageTitle";
import { HabitScoreGraph } from "@/components/ui/HabitScoreGraph";
import type { HabitSort } from "@/lib/supabase/types";
import { ALL_TYPES, TYPE_PARAM, type ActionTypeFilter } from "@/lib/actionType";
import { HabitTypeSelector, type HabitTypeOption } from "./HabitTypeSelector";
import { HabitFeed } from "./HabitFeed";
import { ActionFilter } from "./ActionFilter";
import {
  useActionCounts,
  useDailyHabitScores,
  useHabitsView,
} from "./useHabitsView";

import sharedStyles from "../../shared-page.module.css";
import styles from "./page.module.css";

const ACTION_PARAM = "action";
const SORT_PARAM = "sort";

export default function HabitsPage() {
  return (
    <Suspense fallback={null}>
      <HabitsPageInner />
    </Suspense>
  );
}

function HabitsPageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { canManage, visibleTypes, typeFilter, actionTypes, ready } =
    useHabitsView();
  const readyTypes = ready ? actionTypes : null;

  const typeOptions = useMemo<HabitTypeOption<ActionTypeFilter>[]>(
    () => [...visibleTypes, { value: ALL_TYPES, label: "All" }],
    [visibleTypes]
  );

  const actionParam = Number(searchParams.get(ACTION_PARAM));
  const actionId =
    Number.isInteger(actionParam) && actionParam > 0 ? actionParam : null;
  const sort: HabitSort =
    searchParams.get(SORT_PARAM) === "asc" ? "asc" : "desc";

  const { scores, loading, error } = useDailyHabitScores(readyTypes, actionId);
  const actions = useActionCounts(readyTypes);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const replaceParams = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams);
      for (const [key, value] of Object.entries(patch)) {
        if (value === null) next.delete(key);
        else next.set(key, value);
      }
      router.replace(`${pathname}?${next}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const handleTypeChange = useCallback(
    (type: ActionTypeFilter) => {
      setSelectedDate(null);
      replaceParams({ [TYPE_PARAM]: String(type), [ACTION_PARAM]: null });
    },
    [replaceParams]
  );

  return (
    <div className={sharedStyles.page}>
      <PageTitle title="Habit Tracker" />
      <h1 className={sharedStyles.title}>
        Habit Tracker
        {canManage && (
          <Link
            href={`/apps/habits/create?${TYPE_PARAM}=${typeFilter === ALL_TYPES ? 1 : typeFilter}`}
            aria-label="Create habit"
            className={styles.createLink}
          >
            +
          </Link>
        )}
      </h1>
      <div className={styles.typeRow}>
        <HabitTypeSelector
          value={typeFilter}
          onChange={handleTypeChange}
          disabled={loading}
          types={typeOptions}
        />
        <Link
          href={`/apps/habits/insights?${TYPE_PARAM}=${typeFilter}`}
          className={styles.insightsLink}
        >
          Insights →
        </Link>
      </div>
      <HabitScoreGraph
        scores={scores}
        loading={loading}
        error={error}
        actionType={typeFilter}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />
      <ActionFilter
        actions={actions}
        value={actionId}
        onChange={(id) =>
          replaceParams({ [ACTION_PARAM]: id === null ? null : String(id) })
        }
        sort={sort}
        onSortChange={(next) =>
          replaceParams({ [SORT_PARAM]: next === "asc" ? "asc" : null })
        }
      />
      {ready && (
        <HabitFeed
          key={`${actionTypes.join(",")}-${actionId ?? "all"}-${sort}-${selectedDate ?? "all"}`}
          actionTypes={actionTypes}
          actionId={actionId}
          sort={sort}
          selectedDate={selectedDate}
          onClearDate={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}
