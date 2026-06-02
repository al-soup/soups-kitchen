"use client";

import type { Resource } from "@/lib/supabase/types";
import { ResourceCard } from "./ResourceCard";
import styles from "./ResourceGrid.module.css";

interface ResourceGridProps {
  resources: Resource[];
  onRename?: (id: string, label: string) => Promise<void>;
  onDelete?: (resource: Resource) => Promise<void>;
}

export function ResourceGrid({
  resources,
  onRename,
  onDelete,
}: ResourceGridProps) {
  if (resources.length === 0) {
    const canUpload = !!onRename && !!onDelete;
    return (
      <p className={styles.empty}>
        {canUpload
          ? "No resources yet. Upload one above."
          : "No resources yet."}
      </p>
    );
  }
  return (
    <div className={styles.grid}>
      {resources.map((r) => (
        <ResourceCard
          key={r.id}
          resource={r}
          onRename={onRename}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
