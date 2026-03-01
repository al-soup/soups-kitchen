import type { ActionType, HabitDetail } from "@/lib/supabase/types";
import styles from "./HabitFeedItem.module.css";

function getBadgeStyle(type: ActionType, level: number) {
  const prefix = type === 2 ? "t2-" : type === 3 ? "t3-" : "";
  return {
    background: `var(--habit-score-${prefix}level-${level})`,
    color: "var(--foreground)",
    borderColor: "transparent",
  };
}

export function HabitFeedItem({ habit }: { habit: HabitDetail }) {
  const { action, note } = habit;
  const badgeStyle =
    action.level != null ? getBadgeStyle(action.type, action.level) : undefined;

  return (
    <div className={styles.item}>
      <div className={styles.meta}>
        {action.level != null && (
          <span className={styles.levelBadge} style={badgeStyle}>
            L{action.level}
          </span>
        )}
        <span className={styles.name}>
          {action.name ?? `Action ${action.id}`}
        </span>
      </div>
      {note && <p className={styles.note}>{note}</p>}
    </div>
  );
}
