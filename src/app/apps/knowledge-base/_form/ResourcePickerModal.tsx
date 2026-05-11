"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Resource } from "@/lib/supabase/types";
import {
  getSignedUrl,
  listResources,
  placeholderToken,
} from "@/app/resources/api";
import styles from "./ResourcePickerModal.module.css";

interface ResourcePickerModalProps {
  open: boolean;
  onClose: () => void;
  onPick: (token: string, resource: Resource) => void;
}

export function ResourcePickerModal({
  open,
  onClose,
  onPick,
}: ResourcePickerModalProps) {
  const [resources, setResources] = useState<Resource[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const triedRef = useRef(false);

  useEffect(() => {
    if (!open || triedRef.current) return;
    triedRef.current = true;
    listResources()
      .then((data) => {
        setResources(data);
        setError(null);
      })
      .catch((err: Error) => {
        setError(err.message);
        setResources([]);
      });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const loading = open && resources === null && !error;

  const filtered = useMemo(() => {
    if (!resources) return [];
    if (!query.trim()) return resources;
    const q = query.toLowerCase();
    return resources.filter((r) => {
      return (
        (r.label ?? "").toLowerCase().includes(q) ||
        (r.filename ?? "").toLowerCase().includes(q)
      );
    });
  }, [resources, query]);

  const handlePick = useCallback(
    (resource: Resource) => {
      onPick(placeholderToken(resource.id), resource);
      onClose();
    },
    [onPick, onClose]
  );

  if (!open) return null;

  return (
    <div
      className={styles.backdrop}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Insert resource"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h2 className={styles.title}>Insert resource</h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>
        <input
          type="search"
          className={styles.search}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by label or filename…"
          aria-label="Filter resources"
          autoFocus
        />
        <div className={styles.results}>
          {loading && <p className={styles.message}>Loading resources…</p>}
          {error && (
            <p className={`${styles.message} ${styles.error}`}>{error}</p>
          )}
          {!loading && !error && filtered.length === 0 && (
            <p className={styles.message}>
              {(resources?.length ?? 0) === 0
                ? "No resources uploaded yet."
                : "No matches."}
            </p>
          )}
          {filtered.length > 0 && (
            <ul className={styles.grid}>
              {filtered.map((resource) => (
                <li key={resource.id}>
                  <PickerTile resource={resource} onPick={handlePick} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

interface PickerTileProps {
  resource: Resource;
  onPick: (resource: Resource) => void;
}

function isPreviewable(mime: string | null) {
  return !!mime && (mime.startsWith("image/") || mime.startsWith("video/"));
}

function PickerTile({ resource, onPick }: PickerTileProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isPreviewable(resource.mime_type)) return;
    let cancelled = false;
    getSignedUrl(resource)
      .then((url) => {
        if (!cancelled) setPreviewUrl(url);
      })
      .catch(() => {
        // Preview is non-critical.
      });
    return () => {
      cancelled = true;
    };
  }, [resource]);

  const label = resource.label || resource.filename || "Untitled";
  const isImage = resource.mime_type?.startsWith("image/");

  return (
    <button
      type="button"
      className={styles.tile}
      onClick={() => onPick(resource)}
      title={label}
    >
      <div className={styles.thumb}>
        {isImage && previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt={label} className={styles.thumbImg} />
        ) : (
          <span className={styles.thumbMime}>
            {(resource.mime_type ?? "file").split("/")[1] ?? "file"}
          </span>
        )}
      </div>
      <span className={styles.tileLabel}>{label}</span>
    </button>
  );
}
