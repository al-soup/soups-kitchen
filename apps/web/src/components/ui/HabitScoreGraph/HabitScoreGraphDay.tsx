import type { ActionType } from "@/lib/supabase/types";
import { actionTypeLabel } from "@/lib/actionType";
import { habitScoreColor, MAX_SCORE_LEVEL } from "@/lib/badgeStyles";
import styles from "./HabitScoreGraphDay.module.css";

export type DaySegment = {
  type: ActionType;
  score: number;
  habitCount: number;
};

interface HabitScoreGraphDayProps {
  date: string;
  segments: DaySegment[];
  loading: boolean;
  selected?: boolean;
  onClick?: () => void;
}

function formatTooltipDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function entries(n: number): string {
  return `${n} ${n === 1 ? "entry" : "entries"}`;
}

export function HabitScoreGraphDay({
  date,
  segments,
  loading,
  selected,
  onClick,
}: HabitScoreGraphDayProps) {
  const total = segments.reduce((sum, s) => sum + s.score, 0);
  const habitCount = segments.reduce((sum, s) => sum + s.habitCount, 0);
  const level = Math.min(total, MAX_SCORE_LEVEL);
  const Tag = onClick ? "button" : "div";
  const combined = segments.length > 1;

  return (
    <Tag
      className={styles.cell}
      data-level={level}
      data-combined={combined || undefined}
      data-loading={loading || undefined}
      data-selected={selected || undefined}
      role="gridcell"
      {...(onClick ? { type: "button" as const, onClick } : {})}
    >
      {segments.map((s) => (
        <span
          key={s.type}
          className={styles.stripe}
          style={{ background: habitScoreColor(s.type, s.score) }}
        />
      ))}
      {habitCount > 0 && !loading && (
        <div className={styles.tooltip}>
          <strong>{formatTooltipDate(date)}</strong>
          {combined ? (
            segments
              .filter((s) => s.habitCount > 0)
              .map((s) => (
                <span key={s.type}>
                  {actionTypeLabel(s.type)}: {entries(s.habitCount)}
                </span>
              ))
          ) : (
            <span>{entries(habitCount)}</span>
          )}
        </div>
      )}
    </Tag>
  );
}
