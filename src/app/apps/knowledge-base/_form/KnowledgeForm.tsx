"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Tag } from "@/lib/supabase/types";
import { listTags } from "@/app/apps/knowledge-base/tags/api";
import { TagPicker } from "./TagPicker";
import { ResourcePickerModal } from "./ResourcePickerModal";
import type { KnowledgeFormInput } from "./api";
import styles from "./KnowledgeForm.module.css";

export interface KnowledgeFormInitial {
  question: string;
  summary: string;
  detail: string | null;
  tagIds: string[];
}

interface KnowledgeFormProps {
  initial?: KnowledgeFormInitial;
  submitLabel: string;
  onSubmit: (input: KnowledgeFormInput) => Promise<void>;
  onCancel?: () => void;
  extraActions?: React.ReactNode;
}

const EMPTY_INITIAL: KnowledgeFormInitial = {
  question: "",
  summary: "",
  detail: "",
  tagIds: [],
};

export function KnowledgeForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
  extraActions,
}: KnowledgeFormProps) {
  const base = initial ?? EMPTY_INITIAL;
  const [question, setQuestion] = useState(base.question);
  const [summary, setSummary] = useState(base.summary);
  const [detail, setDetail] = useState(base.detail ?? "");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(base.tagIds)
  );
  const [committed, setCommitted] = useState<KnowledgeFormInitial>(base);

  const [tags, setTags] = useState<Tag[]>([]);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [tagsError, setTagsError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  const [pickerOpen, setPickerOpen] = useState(false);
  const detailRef = useRef<HTMLTextAreaElement | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, []);

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

  const handleTagCreated = useCallback((tag: Tag) => {
    setTags((prev) =>
      [...prev, tag].sort((a, b) => a.name.localeCompare(b.name))
    );
  }, []);

  const insertAtCursor = useCallback((text: string) => {
    const textarea = detailRef.current;
    if (!textarea) {
      setDetail((prev) => (prev ? `${prev}\n\n${text}` : text));
      return;
    }
    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? textarea.value.length;
    const before = textarea.value.slice(0, start);
    const after = textarea.value.slice(end);
    const next = `${before}${text}${after}`;
    setDetail(next);
    requestAnimationFrame(() => {
      textarea.focus();
      const pos = start + text.length;
      textarea.setSelectionRange(pos, pos);
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    setSubmitError(null);
    const snapshot: KnowledgeFormInitial = {
      question,
      summary,
      detail: detail || null,
      tagIds: Array.from(selectedIds),
    };
    try {
      await onSubmit({
        question,
        summary,
        detail: detail || null,
        tagIds: Array.from(selectedIds),
      });
      setCommitted(snapshot);
      setSavedFlash(true);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      savedTimerRef.current = setTimeout(() => setSavedFlash(false), 2000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  }, [question, summary, detail, selectedIds, onSubmit]);

  const isDirty = useMemo(() => {
    if (question !== committed.question) return true;
    if (summary !== committed.summary) return true;
    const detailNow = detail || null;
    const detailWas = committed.detail || null;
    if (detailNow !== detailWas) return true;
    const a = Array.from(selectedIds).sort();
    const b = [...committed.tagIds].sort();
    if (a.length !== b.length) return true;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return true;
    }
    return false;
  }, [question, summary, detail, selectedIds, committed]);

  const canSubmit =
    question.trim().length > 0 &&
    summary.trim().length > 0 &&
    !submitting &&
    isDirty;

  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit) handleSubmit();
      }}
    >
      <label className={styles.field}>
        <span className={styles.label}>Question</span>
        <input
          type="text"
          className={styles.input}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="What problem does this entry capture?"
          maxLength={500}
          required
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Summary</span>
        <textarea
          className={styles.summary}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
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
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          placeholder="Longer explanation, code snippets, references. Use {{resource:<id>}} to embed uploads."
          rows={10}
        />
        <div className={styles.detailActions}>
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
            onChange={setSelectedIds}
            onTagCreated={handleTagCreated}
          />
        )}
      </div>

      <div className={styles.actions}>
        {onCancel && (
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className={styles.submitBtn}
          disabled={!canSubmit}
        >
          {submitting ? "Saving…" : submitLabel}
        </button>
        {extraActions}
      </div>
      <div
        className={styles.statusRow}
        data-visible={savedFlash || submitError ? "true" : "false"}
        aria-live="polite"
      >
        {submitError ? (
          <span className={styles.error}>{submitError}</span>
        ) : savedFlash ? (
          <span className={styles.saved}>Saved.</span>
        ) : null}
      </div>

      <ResourcePickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(token) => insertAtCursor(token)}
      />
    </form>
  );
}
