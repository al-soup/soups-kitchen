"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PageTitle } from "@/components/ui/PageTitle";
import { HabitScoreGraph } from "@/components/ui/HabitScoreGraph";
import { ALL_TYPES, TYPE_PARAM, type ActionTypeFilter } from "@/lib/actionType";
import { HabitTypeSelector, type HabitTypeOption } from "./HabitTypeSelector";
import { HabitFeed } from "./HabitFeed";
import { useDailyHabitScores, useHabitsView } from "./useHabitsView";

import sharedStyles from "../../shared-page.module.css";
import styles from "./page.module.css";

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
  const { canManage, visibleTypes, typeFilter, actionTypes } = useHabitsView();

  const typeOptions = useMemo<HabitTypeOption<ActionTypeFilter>[]>(
    () => [...visibleTypes, { value: ALL_TYPES, label: "All" }],
    [visibleTypes]
  );

  const { scores, loading, error } = useDailyHabitScores(actionTypes);
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
      replaceParams({ [TYPE_PARAM]: String(type) });
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
      <HabitTypeSelector
        value={typeFilter}
        onChange={handleTypeChange}
        disabled={loading}
        types={typeOptions}
      />
      <HabitScoreGraph
        scores={scores}
        loading={loading}
        error={error}
        actionType={typeFilter}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />
      <HabitFeed
        key={`${actionTypes.join(",")}-${selectedDate ?? "all"}`}
        actionTypes={actionTypes}
        selectedDate={selectedDate}
        onClearDate={() => setSelectedDate(null)}
      />
    </div>
  );
}
