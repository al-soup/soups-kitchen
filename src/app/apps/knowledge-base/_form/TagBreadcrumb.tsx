import type { Tag } from "@/lib/supabase/types";
import styles from "./TagBreadcrumb.module.css";

interface TagBreadcrumbProps {
  tags: Tag[];
  size?: "xs" | "sm" | "md";
  className?: string;
}

export function TagBreadcrumb({
  tags,
  size = "sm",
  className,
}: TagBreadcrumbProps) {
  if (tags.length === 0) return null;
  const topics = tags.filter((t) => t.type === "topic");
  const concepts = tags.filter((t) => t.type === "concept");

  const sizeClass =
    size === "md" ? styles.md : size === "xs" ? styles.xs : null;
  const classes = [styles.path, sizeClass, className].filter(Boolean).join(" ");

  return (
    <span className={classes}>
      {topics.length > 0 && (
        <span className={styles.group}>
          {topics.map((t) => (
            <span key={t.id} className={styles.topic}>
              {t.name}
            </span>
          ))}
        </span>
      )}
      {topics.length > 0 && concepts.length > 0 && (
        <span className={styles.chevron} aria-hidden="true">
          ❯
        </span>
      )}
      {concepts.length > 0 && (
        <span className={styles.group}>
          {concepts.map((c) => (
            <span key={c.id} className={styles.concept}>
              {c.name}
            </span>
          ))}
        </span>
      )}
    </span>
  );
}
