"use client";

import type { CSSProperties } from "react";
import type { Tag, TagType } from "@/lib/supabase/types";
import styles from "./pills.module.css";

interface TagPillsProps {
  tags: Tag[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  variant: TagType;
  colorFor?: (tag: Tag) => { solid: string; border: string };
}

type PillStyle = CSSProperties & {
  "--pill-solid"?: string;
  "--pill-border"?: string;
};

export function TagPills({
  tags,
  selectedIds,
  onToggle,
  variant,
  colorFor,
}: TagPillsProps) {
  if (tags.length === 0) return null;
  const selected = new Set(selectedIds);
  return (
    <ul className={styles.list}>
      {tags.map((tag) => {
        const isSelected = selected.has(tag.id);
        const swatch = colorFor?.(tag);
        const style: PillStyle | undefined = swatch
          ? { "--pill-solid": swatch.solid, "--pill-border": swatch.border }
          : undefined;
        return (
          <li key={tag.id}>
            <button
              type="button"
              className={`${styles.pill} ${styles[variant]} ${
                isSelected ? styles.pillSelected : ""
              }`}
              aria-pressed={isSelected}
              onClick={() => onToggle(tag.id)}
              style={style}
            >
              {tag.name}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
