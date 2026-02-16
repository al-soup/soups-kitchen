import styles from "./HabitScoreGraphDay.module.css";

interface HabitScoreGraphDayProps {
  date: string;
  score: number;
  habitCount: number;
  loading: boolean;
}

function formatTooltipDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function HabitScoreGraphDay({
  date,
  score,
  habitCount,
  loading,
}: HabitScoreGraphDayProps) {
  const level = Math.min(score, 6);

  return (
    <div
      className={styles.cell}
      data-level={level}
      data-loading={loading || undefined}
      role="gridcell"
    >
      {habitCount > 0 && !loading && (
        <div className={styles.tooltip}>
          <strong>{formatTooltipDate(date)}</strong>
          <span>
            {`${habitCount} ${habitCount === 1 ? "entry" : "entries"}`}
          </span>
        </div>
      )}
    </div>
  );
}
