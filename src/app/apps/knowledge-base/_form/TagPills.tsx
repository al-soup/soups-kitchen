"use client";

import type { Tag, TagType } from "@/lib/supabase/types";
import styles from "./pills.module.css";

interface TagPillsProps {
  tags: Tag[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  variant: TagType;
}

export function TagPills({
  tags,
  selectedIds,
  onToggle,
  variant,
}: TagPillsProps) {
  if (tags.length === 0) return null;
  const selected = new Set(selectedIds);
  return (
    <ul className={styles.list}>
      {tags.map((tag) => {
        const isSelected = selected.has(tag.id);
        return (
          <li key={tag.id}>
            <button
              type="button"
              className={`${styles.pill} ${styles[variant]} ${
                isSelected ? styles.pillSelected : ""
              }`}
              aria-pressed={isSelected}
              onClick={() => onToggle(tag.id)}
            >
              {tag.name}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
