"use client";

import { Suspense, useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PageTitle } from "@/components/ui/PageTitle";
import {
  actionTypeQuery,
  ALL_TYPES,
  type ActionTypeFilter,
} from "@/lib/actionType";
import { getLocalToday } from "@/lib/dateUtils";
import { HabitTypeSelector, type HabitTypeOption } from "../HabitTypeSelector";
import {
  useActionCounts,
  useDailyHabitScores,
  useHabitsView,
} from "../useHabitsView";
import { BarChart } from "./BarChart";
import { RankedActions } from "./RankedActions";
import {
  addDays,
  computeStreaks,
  isoWeek,
  rankActions,
  weekdayAverages,
  weeklyTotals,
} from "./insights";

import sharedStyles from "../../../shared-page.module.css";
import styles from "./page.module.css";

const WEEKS = 12;
const RANKING_DAYS = 90;

function shortDate(date: string): string {
  return new Date(date + "T12:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export default function InsightsPage() {
  return (
    <Suspense fallback={null}>
      <InsightsPageInner />
    </Suspense>
  );
}

function InsightsPageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const { visibleTypes, typeFilter, actionTypes, ready } = useHabitsView();
  const readyTypes = ready ? actionTypes : null;
  const typeOptions = useMemo<HabitTypeOption<ActionTypeFilter>[]>(
    () => [...visibleTypes, { value: ALL_TYPES, label: "All" }],
    [visibleTypes]
  );

  const { scores, loading, error } = useDailyHabitScores(readyTypes);
  const today = getLocalToday();
  const counts = useActionCounts(readyTypes, addDays(today, -RANKING_DAYS));

  const handleTypeChange = useCallback(
    (type: ActionTypeFilter) => {
      router.replace(`${pathname}${actionTypeQuery(type)}`, { scroll: false });
    },
    [router, pathname]
  );

  const streaks = useMemo(() => computeStreaks(scores, today), [scores, today]);
  const weeks = useMemo(
    () =>
      weeklyTotals(scores, today, WEEKS).map((w) => ({
        key: w.weekStart,
        label: `W${w.week}`,
        detail: `CW ${w.week} (${shortDate(w.weekStart)})`,
        byType: w.byType,
        total: w.total,
      })),
    [scores, today]
  );
  const weekdays = useMemo(
    () =>
      weekdayAverages(scores, today, WEEKS).map((d) => ({
        key: d.label,
        label: d.label,
        byType: d.byType,
        total: d.total,
      })),
    [scores, today]
  );
  const ranked = useMemo(() => rankActions(counts), [counts]);
  const thisWeek = weeks[weeks.length - 1]?.total ?? 0;

  return (
    <div className={sharedStyles.page}>
      <PageTitle title="Habit Insights" />
      <div className={styles.header}>
        <Link
          href={`/apps/habits${actionTypeQuery(typeFilter)}`}
          className={styles.backLink}
          aria-label="Back to habits"
        >
          ←
        </Link>
        <h1 className={sharedStyles.title}>Insights</h1>
      </div>
      <HabitTypeSelector
        value={typeFilter}
        onChange={handleTypeChange}
        disabled={loading}
        types={typeOptions}
      />

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.tiles} data-loading={loading || undefined}>
        <StatTile label="Current streak" value={`${streaks.current}d`} />
        <StatTile
          label="Longest streak"
          value={`${streaks.longest}d`}
          hint="past year"
        />
        <StatTile
          label="Active days"
          value={`${streaks.activeDays}/${streaks.windowDays}`}
          hint="last 30 days"
        />
        <StatTile
          label="Score this week"
          value={String(thisWeek)}
          hint={`CW ${isoWeek(today)} · Mon–today`}
        />
      </div>

      <section className={styles.section} data-loading={loading || undefined}>
        <BarChart
          title={`Weekly score · last ${WEEKS} weeks`}
          bars={weeks}
          types={actionTypes}
        />
      </section>

      <section className={styles.section} data-loading={loading || undefined}>
        <BarChart
          title={`Weekday rhythm · avg score, ${WEEKS} weeks`}
          bars={weekdays}
          types={actionTypes}
        />
      </section>

      <section className={styles.section}>
        <RankedActions
          title={`Top actions · last ${RANKING_DAYS} days`}
          actions={ranked}
        />
      </section>
    </div>
  );
}

function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className={styles.tile}>
      <span className={styles.tileLabel}>{label}</span>
      <span className={styles.tileValue}>{value}</span>
      {hint && <span className={styles.tileHint}>{hint}</span>}
    </div>
  );
}
