"use client";

import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useCanManage } from "@/hooks/useCanManage";
import { listTags } from "@/app/apps/knowledge-base/tags/api";
import { getSignedUrlsByIds, type ResolvedResource } from "@/app/resources/api";
import { EyeIcon, PencilIcon } from "@/constants/icons";
import type { Knowledge, Tag } from "@/lib/supabase/types";
import {
  deleteKnowledge,
  getKnowledge,
  NotFoundError,
  updateKnowledge,
} from "../_form/api";
import { KnowledgeFields } from "../_form/KnowledgeFields";
import {
  extractResourceIds,
  replaceResourceTokens,
} from "../_form/resolveResourceTokens";
import { isDraftDirty, type KnowledgeFormInitial } from "../_form/types";
import { TagBreadcrumb } from "../_form/TagBreadcrumb";
import { formatDate, formatDateTime } from "../_form/format";
import sharedStyles from "../../../shared-page.module.css";
import styles from "./page.module.css";

const MarkdownDetail = dynamic(
  () => import("../_form/MarkdownDetail").then((m) => m.MarkdownDetail),
  { ssr: false, loading: () => <div className={styles.detailSkeleton} /> }
);

const MarkdownSummary = dynamic(
  () => import("../_form/MarkdownSummary").then((m) => m.MarkdownSummary),
  { ssr: false, loading: () => null }
);

const MarkdownInline = dynamic(
  () => import("../_form/MarkdownInline").then((m) => m.MarkdownInline),
  { ssr: false, loading: () => null }
);

interface DetailPageProps {
  params: Promise<{ id: string }>;
}

type Mode = "preview" | "edit";

type LoadState =
  | { kind: "loading" }
  | { kind: "loaded"; entry: Knowledge; allTags: Tag[] }
  | { kind: "notFound" }
  | { kind: "error"; message: string };

function entryToInitial(
  entry: Knowledge,
  tagIds: string[]
): KnowledgeFormInitial {
  return {
    question: entry.question,
    summary: entry.summary,
    detail: entry.detail,
    tagIds,
  };
}

export default function KnowledgeDetailPage({ params }: DetailPageProps) {
  const { id: rawId } = use(params);
  const id = Number(rawId);
  const idValid = Number.isInteger(id) && id > 0;
  usePageTitle("Entry", "Knowledge Base");

  const router = useRouter();
  const { canManage } = useCanManage("knowledge");

  const [state, setState] = useState<LoadState>(
    idValid ? { kind: "loading" } : { kind: "notFound" }
  );
  const [mode, setMode] = useState<Mode>("preview");
  const [draft, setDraft] = useState<KnowledgeFormInitial | null>(null);
  const [committed, setCommitted] = useState<KnowledgeFormInitial | null>(null);

  const [renderedDetail, setRenderedDetail] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const submittingRef = useRef(false);
  const deletingRef = useRef(false);
  const sentinelPushedRef = useRef(false);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    },
    []
  );

  useEffect(() => {
    if (!idValid) return;
    const controller = new AbortController();
    Promise.all([getKnowledge(id), listTags()])
      .then(([{ entry, tagIds }, allTags]) => {
        if (controller.signal.aborted) return;
        const initial = entryToInitial(entry, tagIds);
        setState({ kind: "loaded", entry, allTags });
        setDraft(initial);
        setCommitted(initial);
      })
      .catch((err: Error) => {
        if (controller.signal.aborted) return;
        if (err instanceof NotFoundError) {
          setState({ kind: "notFound" });
        } else {
          setState({ kind: "error", message: err.message });
        }
      });
    return () => controller.abort();
  }, [id, idValid]);

  // Snap back to preview if a viewer somehow ends up in edit mode (e.g. lost
  // role between mounts).
  useEffect(() => {
    if (!canManage && mode !== "preview") setMode("preview");
  }, [canManage, mode]);

  const isDirty = useMemo(
    () => (draft && committed ? isDraftDirty(draft, committed) : false),
    [draft, committed]
  );

  // Resolve resource tokens for the preview based on the draft so the user
  // sees their in-progress edits.
  const detailForPreview = draft?.detail ?? null;
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!detailForPreview) {
        if (!cancelled) setRenderedDetail(null);
        return;
      }
      const ids = extractResourceIds(detailForPreview);
      let lookup: Record<string, ResolvedResource> = {};
      if (ids.length > 0) lookup = await getSignedUrlsByIds(ids);
      if (cancelled) return;
      setRenderedDetail(replaceResourceTokens(detailForPreview, lookup));
    })();
    return () => {
      cancelled = true;
    };
  }, [detailForPreview]);

  // Warn on tab close / refresh while there are unsaved changes.
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  // Intercept browser back/forward navigation while there are unsaved changes.
  // Push one sentinel entry per dirty session (tracked via ref so repeated
  // dirty cycles don't pile entries into history). Sentinel persists after
  // save — a single extra back-press is acceptable to keep this simple.
  useEffect(() => {
    if (!isDirty) return;
    if (!sentinelPushedRef.current) {
      window.history.pushState({ __kbGuard: true }, "");
      sentinelPushedRef.current = true;
    }
    const handler = () => {
      if (window.confirm("You have unsaved changes. Leave without saving?")) {
        sentinelPushedRef.current = false;
        window.history.back();
      } else {
        window.history.pushState({ __kbGuard: true }, "");
        sentinelPushedRef.current = true;
      }
    };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, [isDirty]);

  const handleSave = useCallback(async () => {
    if (submittingRef.current || !draft) return;
    // Snapshot the draft *before* await so concurrent edits aren't lost.
    const snapshot = draft;
    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const updated = await updateKnowledge(id, {
        question: snapshot.question,
        summary: snapshot.summary,
        detail: snapshot.detail || null,
        tagIds: snapshot.tagIds,
      });
      const savedAs = entryToInitial(updated, [...snapshot.tagIds]);
      // Only update `committed` — leave `draft` alone so edits made during
      // the save survive and the form stays dirty if so.
      setCommitted(savedAs);
      setState((prev) =>
        prev.kind === "loaded" ? { ...prev, entry: updated } : prev
      );
      setSavedFlash(true);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      savedTimerRef.current = setTimeout(() => setSavedFlash(false), 2000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Save failed");
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }, [draft, id]);

  const handleCancel = useCallback(() => {
    if (!committed) return;
    if (isDirty && !window.confirm("Discard unsaved changes?")) {
      return;
    }
    setDraft(committed);
    setSubmitError(null);
  }, [committed, isDirty]);

  const handleDelete = useCallback(async () => {
    if (deletingRef.current) return;
    if (!window.confirm("Delete this entry? This cannot be undone.")) return;
    deletingRef.current = true;
    setDeleting(true);
    try {
      await deleteKnowledge(id);
      router.push("/apps/knowledge-base");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
      deletingRef.current = false;
      setDeleting(false);
    }
  }, [id, router]);

  const handleBack = useCallback(() => {
    if (isDirty) {
      if (!window.confirm("You have unsaved changes. Leave without saving?")) {
        return;
      }
      // Dirty path also pushed a popstate sentinel; falling through to back()
      // would only consume the sentinel. Push the list URL directly instead.
      router.push("/apps/knowledge-base");
      return;
    }
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/apps/knowledge-base");
    }
  }, [isDirty, router]);

  if (state.kind === "loading" || !draft) {
    return (
      <div className={sharedStyles.page}>
        <p>Loading…</p>
      </div>
    );
  }

  if (state.kind === "notFound") {
    return (
      <div className={sharedStyles.page}>
        <div className={styles.header}>
          <button
            type="button"
            className={styles.backLink}
            onClick={handleBack}
            aria-label="Back to Knowledge Base"
          >
            ←
          </button>
          <h1 className={sharedStyles.title}>Entry not found</h1>
        </div>
        <p className={sharedStyles.description}>
          No knowledge entry exists with id <code>{rawId}</code>.
        </p>
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className={sharedStyles.page}>
        <p className={styles.error}>{state.message}</p>
      </div>
    );
  }

  const { entry, allTags } = state;
  const selectedTags = allTags
    .filter((t) => draft.tagIds.includes(t.id))
    .sort((a, b) => a.name.localeCompare(b.name));

  const canSave =
    draft.question.trim().length > 0 &&
    draft.summary.trim().length > 0 &&
    !submitting &&
    isDirty;

  const showActions = canManage && (isDirty || mode === "edit");

  return (
    <div className={sharedStyles.page}>
      <div className={styles.header}>
        <button
          type="button"
          className={styles.backLink}
          onClick={handleBack}
          aria-label="Back to Knowledge Base"
        >
          ←
        </button>
        <h1 className={styles.question}>
          {mode === "preview" ? (
            <MarkdownInline source={draft.question || entry.question} />
          ) : (
            "Edit entry"
          )}
        </h1>
      </div>

      {mode === "preview" ? (
        <>
          {selectedTags.length > 0 && (
            <p className={styles.tagPathRow} aria-label="Tags">
              <TagBreadcrumb tags={selectedTags} size="md" />
            </p>
          )}

          <div className={styles.summary}>
            <MarkdownSummary source={draft.summary} />
          </div>

          {renderedDetail && <MarkdownDetail source={renderedDetail} />}

          <p className={styles.dates}>
            Created {formatDate(entry.created_at)}
            {entry.updated_at && entry.updated_at !== entry.created_at && (
              <> · Updated {formatDateTime(entry.updated_at)}</>
            )}
          </p>
        </>
      ) : (
        <KnowledgeFields value={draft} onChange={setDraft} />
      )}

      {showActions && (
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={handleCancel}
            disabled={!isDirty || submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.submitBtn}
            onClick={handleSave}
            disabled={!canSave}
          >
            {submitting ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      )}

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

      {canManage && (
        <button
          type="button"
          className={styles.modeFab}
          onClick={() => setMode(mode === "preview" ? "edit" : "preview")}
          aria-label={
            mode === "preview"
              ? "Switch to edit mode"
              : "Switch to preview mode"
          }
        >
          {mode === "preview" ? (
            <>
              <PencilIcon size={14} />
              <span>Edit</span>
            </>
          ) : (
            <>
              <EyeIcon size={14} />
              <span>Preview</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
