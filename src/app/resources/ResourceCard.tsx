"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Resource } from "@/lib/supabase/types";
import { CheckIcon, CopyIcon, TrashIcon } from "@/constants/icons";
import { getSignedUrl, placeholderToken } from "./api";
import styles from "./ResourceCard.module.css";

interface ResourceCardProps {
  resource: Resource;
  onRename?: (id: string, label: string) => Promise<void>;
  onDelete?: (resource: Resource) => Promise<void>;
}

function isImage(mime: string | null): boolean {
  return !!mime && mime.startsWith("image/");
}

function isVideo(mime: string | null): boolean {
  return !!mime && mime.startsWith("video/");
}

function formatSize(bytes: number | null): string {
  if (bytes == null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function ResourceCard({
  resource,
  onRename,
  onDelete,
}: ResourceCardProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(resource.label ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const savingRef = useRef(false);

  useEffect(() => {
    setLabel(resource.label ?? "");
  }, [resource.label]);

  useEffect(() => {
    if (!isImage(resource.mime_type) && !isVideo(resource.mime_type)) return;
    let cancelled = false;
    getSignedUrl(resource)
      .then((url) => {
        if (!cancelled) setPreviewUrl(url);
      })
      .catch(() => {
        // Preview is non-critical; ignore failures.
      });
    return () => {
      cancelled = true;
    };
  }, [resource]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commitRename = useCallback(async () => {
    if (!onRename) return;
    if (savingRef.current) return;
    const trimmed = label.trim();
    if (!trimmed) {
      setError("Label required");
      return;
    }
    if (trimmed === (resource.label ?? "")) {
      setEditing(false);
      setError(null);
      return;
    }
    savingRef.current = true;
    setBusy(true);
    setError(null);
    try {
      await onRename(resource.id, trimmed);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rename failed");
    } finally {
      savingRef.current = false;
      setBusy(false);
    }
  }, [label, resource.id, resource.label, onRename]);

  const cancelEdit = useCallback(() => {
    setEditing(false);
    setLabel(resource.label ?? "");
    setError(null);
  }, [resource.label]);

  const handleDelete = useCallback(async () => {
    if (!onDelete) return;
    if (busy) return;
    if (
      !window.confirm(
        `Delete "${resource.label ?? resource.filename ?? "resource"}"?`
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      await onDelete(resource);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
      setBusy(false);
    }
  }, [busy, resource, onDelete]);

  const handleCopyToken = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(placeholderToken(resource.id));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("Copy failed");
    }
  }, [resource.id]);

  return (
    <article className={styles.card}>
      <div className={styles.preview}>
        {isImage(resource.mime_type) && previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt={resource.label ?? resource.filename ?? "Preview"}
            className={styles.previewImg}
          />
        ) : isVideo(resource.mime_type) && previewUrl ? (
          <video src={previewUrl} className={styles.previewImg} controls />
        ) : (
          <div className={styles.mimeBadge}>
            {(resource.mime_type ?? "file").split("/")[1] ??
              resource.mime_type ??
              "file"}
          </div>
        )}
      </div>
      <div className={styles.body}>
        {onRename && editing ? (
          <input
            ref={inputRef}
            className={styles.labelInput}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitRename();
              } else if (e.key === "Escape") {
                e.preventDefault();
                cancelEdit();
              }
            }}
            onBlur={commitRename}
            disabled={busy}
            aria-label="Rename resource"
          />
        ) : onRename ? (
          <button
            type="button"
            className={styles.label}
            onClick={() => setEditing(true)}
            disabled={busy}
            aria-label={`Rename ${resource.label ?? resource.filename ?? "resource"}`}
          >
            {resource.label || resource.filename || "Untitled"}
          </button>
        ) : (
          <span className={styles.label}>
            {resource.label || resource.filename || "Untitled"}
          </span>
        )}
        <div className={styles.meta}>
          <span className={styles.filename} title={resource.filename ?? ""}>
            {resource.filename ?? "—"}
          </span>
          <span className={styles.size}>{formatSize(resource.size_bytes)}</span>
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.iconBtn} ${copied ? styles.iconBtnSuccess : ""}`}
            onClick={handleCopyToken}
            disabled={busy}
            aria-label={copied ? "Copied!" : "Copy token"}
            title={copied ? "Copied!" : "Copy token"}
          >
            {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
          </button>
          {onDelete && (
            <button
              type="button"
              className={`${styles.iconBtn} ${styles.deleteBtn}`}
              onClick={handleDelete}
              disabled={busy}
              aria-label="Delete"
              title="Delete"
            >
              <TrashIcon size={16} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
