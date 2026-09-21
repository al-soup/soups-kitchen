"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { KnowledgeFields } from "./KnowledgeFields";
import { isDraftDirty, type KnowledgeFormInitial } from "./types";
import type { KnowledgeFormInput } from "./api";
import styles from "./KnowledgeForm.module.css";

export type { KnowledgeFormInitial };

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
  const [draft, setDraft] = useState<KnowledgeFormInitial>(base);
  const [committed, setCommitted] = useState<KnowledgeFormInitial>(base);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, []);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    setSubmitError(null);
    const snapshot: KnowledgeFormInitial = {
      question: draft.question,
      summary: draft.summary,
      detail: draft.detail || null,
      tagIds: [...draft.tagIds],
    };
    try {
      await onSubmit({
        question: draft.question,
        summary: draft.summary,
        detail: draft.detail || null,
        tagIds: draft.tagIds,
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
  }, [draft, onSubmit]);

  const isDirty = useMemo(
    () => isDraftDirty(draft, committed),
    [draft, committed]
  );

  const canSubmit =
    draft.question.trim().length > 0 &&
    draft.summary.trim().length > 0 &&
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
      <KnowledgeFields value={draft} onChange={setDraft} />

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
    </form>
  );
}
