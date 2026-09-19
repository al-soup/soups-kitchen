import { habitScoreColor } from "@/lib/badgeStyles";
import type { RankedAction } from "./insights";
import { SERIES_LEVEL } from "./BarChart";
import styles from "./RankedActions.module.css";

interface RankedActionsProps {
  title: string;
  actions: RankedAction[];
}

export function RankedActions({ title, actions }: RankedActionsProps) {
  const max = Math.max(1, ...actions.map((a) => a.share));
  return (
    <figure className={styles.figure}>
      <figcaption className={styles.caption}>{title}</figcaption>
      {actions.length === 0 ? (
        <p className={styles.empty}>No habits in this period.</p>
      ) : (
        <ol className={styles.list}>
          {actions.map((a) => (
            <li key={a.id} className={styles.row}>
              <span className={styles.name}>{a.name}</span>
              <span className={styles.count}>
                {a.count}× · {a.score} pts
              </span>
              <span className={styles.track}>
                <span
                  className={styles.fill}
                  style={{
                    width: `${(a.share / max) * 100}%`,
                    background:
                      a.type === null
                        ? "var(--foreground-faint)"
                        : habitScoreColor(a.type, SERIES_LEVEL),
                  }}
                />
              </span>
              <span className={styles.share}>{Math.round(a.share * 100)}%</span>
            </li>
          ))}
        </ol>
      )}
    </figure>
  );
}
