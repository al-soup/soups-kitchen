import Link from "next/link";
import type { HabitDetail } from "@/lib/supabase/types";
import { getBadgeStyle } from "@/lib/badgeStyles";
import { InfoIcon } from "@/constants/icons";
import styles from "./HabitFeedItem.module.css";

interface HabitFeedItemProps {
  habit: HabitDetail;
  showDetailLink?: boolean;
}

export function HabitFeedItem({ habit, showDetailLink }: HabitFeedItemProps) {
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
        {showDetailLink && (
          <Link
            href={`/apps/habits/${habit.id}`}
            className={styles.infoLink}
            aria-label="View habit details"
          >
            <InfoIcon />
          </Link>
        )}
      </div>
      {note && <p className={styles.note}>{note}</p>}
    </div>
  );
}
