import type { HabitDetail } from "@/lib/supabase/types";
import { getBadgeStyle } from "@/lib/badgeStyles";
import styles from "./HabitFeedItem.module.css";

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
