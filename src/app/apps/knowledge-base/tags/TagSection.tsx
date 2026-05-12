"use client";

import { useCallback, useState } from "react";
import type { Tag, TagType } from "@/lib/supabase/types";
import { DuplicateTagError } from "./api";
import { TagRow } from "./TagRow";
import styles from "./TagSection.module.css";

interface TagSectionProps {
  title: string;
  placeholder: string;
  type: TagType;
  tags: Tag[];
  onCreate: (name: string, type: TagType) => Promise<void>;
  onRename: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function TagSection({
  title,
  placeholder,
  type,
  tags,
  onCreate,
  onRename,
  onDelete,
}: TagSectionProps) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      setError("Name required");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onCreate(trimmed, type);
      setDraft("");
    } catch (err) {
      setError(
        err instanceof DuplicateTagError
          ? "Already exists"
          : err instanceof Error
            ? err.message
            : "Failed to add"
      );
    } finally {
      setSubmitting(false);
    }
  }, [draft, type, onCreate]);

  return (
    <section
      className={`${styles.section} ${
        type === "topic" ? styles.topic : styles.concept
      }`}
    >
      <div className={styles.headingRow}>
        <h2 className={styles.heading}>
          <span className={styles.headingDot} aria-hidden="true" />
          {title}
          <span className={styles.count}>{tags.length}</span>
        </h2>
      </div>
      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <input
          className={styles.input}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            if (error) setError(null);
          }}
          placeholder={placeholder}
          disabled={submitting}
          aria-label={placeholder}
        />
        <button
          type="submit"
          className={styles.addBtn}
          disabled={submitting || !draft.trim()}
        >
          Add
        </button>
      </form>
      {error && <p className={styles.error}>{error}</p>}
      {tags.length === 0 ? (
        <p className={styles.empty}>No tags yet.</p>
      ) : (
        <ul className={styles.list}>
          {tags.map((tag) => (
            <TagRow
              key={tag.id}
              tag={tag}
              onRename={onRename}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
