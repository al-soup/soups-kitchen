"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Tag, TagType } from "@/lib/supabase/types";
import {
  createTag,
  DuplicateTagError,
} from "@/app/apps/knowledge-base/tags/api";
import styles from "./TagPicker.module.css";

interface TagPickerProps {
  topics: Tag[];
  concepts: Tag[];
  selectedIds: Set<string>;
  onChange: (next: Set<string>) => void;
  onTagCreated: (tag: Tag) => void;
}

function matches(tag: Tag, query: string) {
  if (!query) return true;
  return tag.name.toLowerCase().includes(query.toLowerCase());
}

function hasExact(tags: Tag[], query: string) {
  const q = query.trim().toLowerCase();
  return tags.some((t) => t.name.toLowerCase() === q);
}

export function TagPicker({
  topics,
  concepts,
  selectedIds,
  onChange,
  onTagCreated,
}: TagPickerProps) {
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState<TagType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredTopics = useMemo(
    () => topics.filter((t) => matches(t, query)),
    [topics, query]
  );
  const filteredConcepts = useMemo(
    () => concepts.filter((t) => matches(t, query)),
    [concepts, query]
  );

  const toggle = useCallback(
    (id: string) => {
      const next = new Set(selectedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      onChange(next);
    },
    [selectedIds, onChange]
  );

  const handleCreate = useCallback(
    async (type: TagType) => {
      const name = query.trim();
      if (!name) return;
      setCreating(type);
      setError(null);
      try {
        const tag = await createTag(name, type);
        onTagCreated(tag);
        const next = new Set(selectedIds);
        next.add(tag.id);
        onChange(next);
        setQuery("");
      } catch (err) {
        setError(
          err instanceof DuplicateTagError
            ? "Already exists"
            : err instanceof Error
              ? err.message
              : "Failed to create tag"
        );
      } finally {
        setCreating(null);
      }
    },
    [query, selectedIds, onChange, onTagCreated]
  );

  const trimmedQuery = query.trim();
  const canShowCreate =
    trimmedQuery.length >= 2 &&
    !hasExact(topics, trimmedQuery) &&
    !hasExact(concepts, trimmedQuery);

  const [showCreate, setShowCreate] = useState(false);
  useEffect(() => {
    if (!canShowCreate) {
      setShowCreate(false);
      return;
    }
    const timer = setTimeout(() => setShowCreate(true), 400);
    return () => clearTimeout(timer);
  }, [canShowCreate]);

  return (
    <div className={styles.picker}>
      <div className={styles.searchRow}>
        <input
          type="search"
          className={styles.search}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Search tags…"
          aria-label="Search tags"
        />
        <div
          className={styles.createRow}
          data-visible={showCreate ? "true" : "false"}
          aria-hidden={!showCreate}
        >
          <span className={styles.createPrefix}>
            Create &ldquo;{trimmedQuery}&rdquo; as
          </span>
          <button
            type="button"
            className={`${styles.createBtn} ${styles.topic}`}
            onClick={() => handleCreate("topic")}
            disabled={!showCreate || creating !== null}
            tabIndex={showCreate ? 0 : -1}
          >
            + Topic
          </button>
          <button
            type="button"
            className={`${styles.createBtn} ${styles.concept}`}
            onClick={() => handleCreate("concept")}
            disabled={!showCreate || creating !== null}
            tabIndex={showCreate ? 0 : -1}
          >
            + Concept
          </button>
        </div>
      </div>
      {error && <p className={styles.error}>{error}</p>}

      <TagList
        title="Topics"
        type="topic"
        tags={filteredTopics}
        totalCount={topics.length}
        selectedIds={selectedIds}
        onToggle={toggle}
      />
      <TagList
        title="Concepts"
        type="concept"
        tags={filteredConcepts}
        totalCount={concepts.length}
        selectedIds={selectedIds}
        onToggle={toggle}
      />
    </div>
  );
}

interface TagListProps {
  title: string;
  type: TagType;
  tags: Tag[];
  totalCount: number;
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
}

function TagList({
  title,
  type,
  tags,
  totalCount,
  selectedIds,
  onToggle,
}: TagListProps) {
  return (
    <details className={styles.section} open>
      <summary className={styles.summary}>
        <span className={styles.summaryTitle}>{title}</span>
        <span className={styles.summaryCount}>
          {tags.length}
          {tags.length !== totalCount ? ` / ${totalCount}` : ""}
        </span>
      </summary>
      {tags.length === 0 ? (
        <p className={styles.empty}>No tags match.</p>
      ) : (
        <ul className={styles.list}>
          {tags.map((tag) => {
            const selected = selectedIds.has(tag.id);
            return (
              <li key={tag.id}>
                <button
                  type="button"
                  className={`${styles.pill} ${styles[type]} ${
                    selected ? styles.pillSelected : ""
                  }`}
                  onClick={() => onToggle(tag.id)}
                  aria-pressed={selected}
                >
                  {tag.name}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </details>
  );
}
