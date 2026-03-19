import styles from "./HabitScoreGraphDay.module.css";

interface HabitScoreGraphDayProps {
  date: string;
  score: number;
  habitCount: number;
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

export function HabitScoreGraphDay({
  date,
  score,
  habitCount,
  loading,
  selected,
  onClick,
}: HabitScoreGraphDayProps) {
  const level = Math.min(score, 6);
  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      className={styles.cell}
      data-level={level}
      data-loading={loading || undefined}
      data-selected={selected || undefined}
      role="gridcell"
      {...(onClick ? { type: "button" as const, onClick } : {})}
    >
      {habitCount > 0 && !loading && (
        <div className={styles.tooltip}>
          <strong>{formatTooltipDate(date)}</strong>
          <span>
            {`${habitCount} ${habitCount === 1 ? "entry" : "entries"}`}
          </span>
        </div>
      )}
    </Tag>
  );
}
