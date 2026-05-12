"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Tag } from "@/lib/supabase/types";
import { DuplicateTagError } from "./api";
import styles from "./TagRow.module.css";

interface TagRowProps {
  tag: Tag;
  onRename: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function TagRow({ tag, onRename, onDelete }: TagRowProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(tag.name);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const savingRef = useRef(false);

  useEffect(() => {
    setValue(tag.name);
  }, [tag.name]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const startEdit = useCallback(() => {
    setError(null);
    setValue(tag.name);
    setEditing(true);
  }, [tag.name]);

  const cancelEdit = useCallback(() => {
    setEditing(false);
    setValue(tag.name);
    setError(null);
  }, [tag.name]);

  const commit = useCallback(async () => {
    if (savingRef.current) return;
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Name required");
      return;
    }
    if (trimmed === tag.name) {
      setEditing(false);
      setError(null);
      return;
    }
    savingRef.current = true;
    setBusy(true);
    setError(null);
    try {
      await onRename(tag.id, trimmed);
      setEditing(false);
    } catch (err) {
      setError(
        err instanceof DuplicateTagError
          ? "Already exists"
          : err instanceof Error
            ? err.message
            : "Rename failed"
      );
    } finally {
      savingRef.current = false;
      setBusy(false);
    }
  }, [value, tag.id, tag.name, onRename]);

  const handleKey = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        commit();
      } else if (e.key === "Escape") {
        e.preventDefault();
        cancelEdit();
      }
    },
    [commit, cancelEdit]
  );

  const handleDelete = useCallback(async () => {
    if (busy) return;
    if (!window.confirm(`Delete tag "${tag.name}"?`)) return;
    setBusy(true);
    try {
      await onDelete(tag.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
      setBusy(false);
    }
  }, [busy, tag.id, tag.name, onDelete]);

  const typeClass = tag.type === "topic" ? styles.topic : styles.concept;
  return (
    <li
      className={`${styles.row} ${typeClass} ${editing ? styles.rowEditing : ""}`}
    >
      {editing ? (
        <input
          ref={inputRef}
          className={styles.input}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          onBlur={commit}
          disabled={busy}
          aria-label={`Rename ${tag.name}`}
          size={Math.max(value.length, 4)}
        />
      ) : (
        <button
          type="button"
          className={styles.name}
          onClick={startEdit}
          disabled={busy}
          aria-label={`Rename ${tag.name}`}
        >
          {tag.name}
        </button>
      )}
      <button
        type="button"
        className={styles.deleteBtn}
        onClick={handleDelete}
        disabled={busy}
        aria-label={`Delete ${tag.name}`}
      >
        ×
      </button>
      {error && <span className={styles.error}>{error}</span>}
    </li>
  );
}
