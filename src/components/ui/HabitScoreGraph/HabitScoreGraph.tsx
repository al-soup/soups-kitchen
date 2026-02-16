"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ActionType, DailyHabitScore } from "@/lib/supabase/types";
import { HabitScoreGraphDay } from "./HabitScoreGraphDay";
import styles from "./HabitScoreGraph.module.css";

interface HabitScoreGraphProps {
  scores: DailyHabitScore[];
  loading: boolean;
  error: string | null;
  actionType: ActionType;
}

const DAY_LABELS = ["Mon", "Wed", "Fri", "Sun"];
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const SCROLL_AMOUNT = 450;

/** Returns 0=Mon..6=Sun */
function isoDay(d: Date): number {
  return (d.getDay() + 6) % 7;
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function HabitScoreGraph({
  scores,
  loading,
  error,
  actionType,
}: HabitScoreGraphProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const { days, weeks, monthLabels } = useMemo(() => {
    const scoreMap = new Map<string, { score: number; habitCount: number }>();
    for (const s of scores) {
      scoreMap.set(s.completed_date, {
        score: s.total_score,
        habitCount: s.habit_ids.length,
      });
    }

    const end = new Date();
    const start = new Date(end);
    start.setFullYear(start.getFullYear() - 1);
    // Align start to previous Monday
    start.setDate(start.getDate() - isoDay(start));

    const allDays: {
      date: string;
      score: number;
      habitCount: number;
      jsDate: Date;
    }[] = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      const dateStr = formatDate(cursor);
      const entry = scoreMap.get(dateStr);
      allDays.push({
        date: dateStr,
        score: entry?.score ?? 0,
        habitCount: entry?.habitCount ?? 0,
        jsDate: new Date(cursor),
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    // Group into weeks — new week starts on Monday
    const weekGroups: (typeof allDays)[] = [];
    let currentWeek: typeof allDays = [];
    for (const day of allDays) {
      if (day.jsDate.getDay() === 1 && currentWeek.length > 0) {
        weekGroups.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(day);
    }
    if (currentWeek.length > 0) weekGroups.push(currentWeek);

    // Month labels
    const labels: { col: number; name: string }[] = [];
    let lastMonth = -1;
    for (let w = 0; w < weekGroups.length; w++) {
      const firstDay = weekGroups[w][0];
      const month = firstDay.jsDate.getMonth();
      if (month !== lastMonth) {
        labels.push({ col: w, name: MONTH_NAMES[month] });
        lastMonth = month;
      }
    }

    return { days: allDays, weeks: weekGroups, monthLabels: labels };
  }, [scores]);

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  // Scroll to end (today) on mount + update buttons
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollLeft = el.scrollWidth;
    updateScrollButtons();
  }, [days, updateScrollButtons]);

  const scroll = (direction: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: direction * SCROLL_AMOUNT });
  };

  const totalWeeks = weeks.length;

  return (
    <div className={styles.outer} data-color-type={actionType}>
      <div className={styles.bodyRow}>
        <div className={styles.dayLabels}>
          {DAY_LABELS.map((label) => (
            <span key={label} className={styles.dayLabel}>
              {label}
            </span>
          ))}
        </div>

        <div
          className={`${styles.wrapper}${canScrollLeft ? ` ${styles.fadeLeft}` : ""}`}
          ref={scrollRef}
          onScroll={updateScrollButtons}
        >
          <div className={styles.scrollContent}>
            <div
              className={styles.monthLabels}
              style={{ gridTemplateColumns: `repeat(${totalWeeks}, 15px)` }}
            >
              {monthLabels.map((ml) => (
                <span
                  key={`${ml.col}-${ml.name}`}
                  className={styles.monthLabel}
                  style={{ gridColumn: ml.col + 1 }}
                >
                  {ml.name}
                </span>
              ))}
            </div>

            <div
              className={styles.grid}
              role="grid"
              aria-label="Habit score graph"
            >
              {days.map((day) => (
                <HabitScoreGraphDay
                  key={day.date}
                  date={day.date}
                  score={day.score}
                  habitCount={day.habitCount}
                  loading={loading}
                />
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className={styles.errorOverlay}>
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Scroll-controls */}
      <div className={styles.bottomBar}>
        <div className={styles.nav}>
          <button
            className={styles.scrollBtn}
            onClick={() => scroll(-1)}
            aria-label="Scroll left"
            disabled={loading || !canScrollLeft}
            style={{ opacity: !loading && canScrollLeft ? 1 : 0.4 }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M10.3 12.3a1 1 0 0 1-1.4 0l-3.6-3.6a1 1 0 0 1 0-1.4l3.6-3.6a1 1 0 1 1 1.4 1.4L7.4 8l2.9 2.9a1 1 0 0 1 0 1.4z" />
            </svg>
          </button>
          <button
            className={styles.scrollBtn}
            onClick={() => scroll(1)}
            aria-label="Scroll right"
            disabled={loading || !canScrollRight}
            style={{ opacity: !loading && canScrollRight ? 1 : 0.4 }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M5.7 3.7a1 1 0 0 1 1.4 0l3.6 3.6a1 1 0 0 1 0 1.4l-3.6 3.6a1 1 0 0 1-1.4-1.4L8.6 8 5.7 5.1a1 1 0 0 1 0-1.4z" />
            </svg>
          </button>
        </div>

        {/* Habit score legend */}
        <div className={styles.footer}>
          <span>Less</span>
          <div className={styles.legendCells}>
            {[0, 1, 2, 3, 4, 5, 6].map((level) => (
              <HabitScoreGraphDay
                loading={false}
                key={level}
                date=""
                score={level}
                habitCount={0}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
