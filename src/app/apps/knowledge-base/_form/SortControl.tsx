"use client";

import type { KnowledgeSort } from "./filterParams";
import styles from "./sortControl.module.css";

const OPTIONS: { value: KnowledgeSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "topic", label: "By topic" },
];

interface SortControlProps {
  value: KnowledgeSort;
  onChange: (value: KnowledgeSort) => void;
}

export function SortControl({ value, onChange }: SortControlProps) {
  return (
    <div className={styles.group} role="group" aria-label="Sort entries">
      {OPTIONS.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            className={`${styles.option} ${isActive ? styles.optionActive : ""}`}
            aria-pressed={isActive}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
