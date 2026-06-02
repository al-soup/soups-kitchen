"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Tag } from "@/lib/supabase/types";
import { listTags } from "@/app/apps/knowledge-base/tags/api";
import { TagPicker } from "./TagPicker";
import { ResourcePickerModal } from "./ResourcePickerModal";
import type { KnowledgeFormInitial } from "./types";
import styles from "./KnowledgeForm.module.css";

interface KnowledgeFieldsProps {
  value: KnowledgeFormInitial;
  onChange: (next: KnowledgeFormInitial) => void;
}

export function KnowledgeFields({ value, onChange }: KnowledgeFieldsProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [tagsError, setTagsError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const detailRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    listTags()
      .then((data) => {
        if (controller.signal.aborted) return;
        setTags(data);
        setTagsError(null);
      })
      .catch((err: Error) => {
        if (controller.signal.aborted) return;
        setTagsError(err.message);
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        setTagsLoading(false);
      });
    return () => controller.abort();
  }, []);

  const { topics, concepts } = useMemo(
    () => ({
      topics: tags.filter((t) => t.type === "topic"),
      concepts: tags.filter((t) => t.type === "concept"),
    }),
    [tags]
  );

  const selectedIds = useMemo(() => new Set(value.tagIds), [value.tagIds]);

  const update = useCallback(
    (patch: Partial<KnowledgeFormInitial>) => {
      onChange({ ...value, ...patch });
    },
    [value, onChange]
  );

  const handleTagCreated = useCallback((tag: Tag) => {
    setTags((prev) =>
      [...prev, tag].sort((a, b) => a.name.localeCompare(b.name))
    );
  }, []);

  const handleTagsChange = useCallback(
    (next: Set<string>) => {
      update({ tagIds: Array.from(next) });
    },
    [update]
  );

  const insertAtCursor = useCallback(
    (text: string, cursorOffset?: number) => {
      const textarea = detailRef.current;
      const current = value.detail ?? "";
      if (!textarea) {
        const next = current ? `${current}\n\n${text}` : text;
        update({ detail: next });
        return;
      }
      const start = textarea.selectionStart ?? current.length;
      const end = textarea.selectionEnd ?? current.length;
      const before = current.slice(0, start);
      const after = current.slice(end);
      const next = `${before}${text}${after}`;
      update({ detail: next });
      requestAnimationFrame(() => {
        textarea.focus();
        const pos = start + (cursorOffset ?? text.length);
        textarea.setSelectionRange(pos, pos);
      });
    },
    [value.detail, update]
  );

  const insertCodeBlock = useCallback(() => {
    const textarea = detailRef.current;
    const current = value.detail ?? "";
    const start = textarea?.selectionStart ?? current.length;
    const end = textarea?.selectionEnd ?? current.length;
    const before = current.slice(0, start);
    const after = current.slice(end);
    const leadingNewlines =
      before.length === 0 || before.endsWith("\n") ? "" : "\n";
    const trailingNewlines =
      after.length === 0 || after.startsWith("\n") ? "" : "\n";
    const block = `${leadingNewlines}\`\`\`\n\n\`\`\`${trailingNewlines}`;
    const cursorOffset = leadingNewlines.length + 4;
    insertAtCursor(block, cursorOffset);
  }, [value.detail, insertAtCursor]);

  return (
    <div className={styles.fields}>
      <label className={styles.field}>
        <span className={styles.label}>Question</span>
        <input
          type="text"
          className={styles.input}
          value={value.question}
          onChange={(e) => update({ question: e.target.value })}
          placeholder="What problem does this entry capture?"
          maxLength={500}
          required
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Summary</span>
        <textarea
          className={styles.summary}
          value={value.summary}
          onChange={(e) => update({ summary: e.target.value })}
          placeholder="One or two sentences."
          rows={2}
          required
        />
      </label>

      <div className={styles.field}>
        <span className={styles.label}>Detail</span>
        <textarea
          ref={detailRef}
          className={styles.detail}
          value={value.detail ?? ""}
          onChange={(e) => update({ detail: e.target.value })}
          placeholder="Longer explanation, code snippets, references. Use {{resource:<id>}} to embed uploads."
          rows={10}
        />
        <div className={styles.detailActions}>
          <button
            type="button"
            className={styles.insertBtn}
            onClick={insertCodeBlock}
          >
            Insert code block
          </button>
          <button
            type="button"
            className={styles.insertBtn}
            onClick={() => setPickerOpen(true)}
          >
            Insert resource
          </button>
        </div>
      </div>

      <div className={styles.field}>
        <span className={styles.label}>Tags</span>
        {tagsLoading && <p className={styles.note}>Loading tags…</p>}
        {tagsError && <p className={styles.error}>{tagsError}</p>}
        {!tagsLoading && !tagsError && (
          <TagPicker
            topics={topics}
            concepts={concepts}
            selectedIds={selectedIds}
            onChange={handleTagsChange}
            onTagCreated={handleTagCreated}
          />
        )}
      </div>

      <ResourcePickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(token) => insertAtCursor(token)}
      />
    </div>
  );
}
