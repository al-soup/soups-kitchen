"use client";

import type { ComponentType } from "react";
import styles from "./PillFilter.module.css";

export interface PillFilterItem {
  label: string;
  count: number;
  icon?: ComponentType<{ size?: number }>;
}

interface PillFilterProps {
  items: PillFilterItem[];
  value: string | null;
  onChange: (value: string | null) => void;
}

export function PillFilter({ items, value, onChange }: PillFilterProps) {
  return (
    <div className={styles.pills}>
      {items.map(({ label, count, icon: Icon }) => (
        <button
          key={label}
          className={`${styles.pill} ${value === label ? styles.pillActive : ""}`}
          onClick={() => onChange(value === label ? null : label)}
        >
          {Icon && <Icon size={14} />}
          {label} ({count})
        </button>
      ))}
    </div>
  );
}
