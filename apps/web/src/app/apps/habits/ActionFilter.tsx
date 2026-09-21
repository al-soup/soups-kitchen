"use client";

import type { ActionCount, HabitSort } from "@/lib/supabase/types";
import { getBadgeStyle } from "@/lib/badgeStyles";
import styles from "./ActionFilter.module.css";

interface ActionFilterProps {
  actions: ActionCount[];
  value: number | null;
  onChange: (actionId: number | null) => void;
  sort: HabitSort;
  onSortChange: (sort: HabitSort) => void;
}

export function ActionFilter({
  actions,
  value,
  onChange,
  sort,
  onSortChange,
}: ActionFilterProps) {
  const items = actions
    .filter((a) => a.habitCount > 0)
    .sort((a, b) => b.habitCount - a.habitCount);

  return (
    <div className={styles.bar}>
      <button
        type="button"
        className={styles.sortToggle}
        onClick={() => onSortChange(sort === "desc" ? "asc" : "desc")}
        aria-label={`Sorted ${sort === "desc" ? "newest" : "oldest"} first, click to reverse`}
      >
        {sort === "desc" ? "Newest ↓" : "Oldest ↑"}
      </button>
      <div className={styles.chips} role="group" aria-label="Filter by action">
        {items.map((a) => {
          const active = a.id === value;
          return (
            <button
              key={a.id}
              type="button"
              className={styles.chip}
              data-active={active || undefined}
              aria-pressed={active}
              onClick={() => onChange(active ? null : a.id)}
            >
              {a.level != null && (
                <span
                  className={styles.level}
                  style={getBadgeStyle(a.type, a.level)}
                >
                  L{a.level}
                </span>
              )}
              <span className={styles.name}>{a.name ?? `Action ${a.id}`}</span>
              <span className={styles.count}>{a.habitCount}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
