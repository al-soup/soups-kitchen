"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { usePageTitle } from "@/hooks/usePageTitle";
import {
  KnowledgeForm,
  type KnowledgeFormInitial,
} from "../../_form/KnowledgeForm";
import {
  deleteKnowledge,
  getKnowledge,
  NotFoundError,
  updateKnowledge,
  type KnowledgeFormInput,
} from "../../_form/api";
import sharedStyles from "../../../../shared-page.module.css";
import styles from "../../create/page.module.css";

interface EditPageProps {
  params: Promise<{ id: string }>;
}

type LoadState =
  | { kind: "loading" }
  | { kind: "loaded"; initial: KnowledgeFormInitial }
  | { kind: "notFound" }
  | { kind: "error"; message: string };

export default function EditKnowledgePage({ params }: EditPageProps) {
  const { id } = use(params);
  usePageTitle("Edit Entry", "Knowledge Base");

  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();

  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace(`/login?redirectTo=${encodeURIComponent(pathname)}`);
    }
  }, [authLoading, user, router, pathname]);

  useEffect(() => {
    if (authLoading || !user) return;
    const controller = new AbortController();
    getKnowledge(id)
      .then(({ entry, tagIds }) => {
        if (controller.signal.aborted) return;
        setState({
          kind: "loaded",
          initial: {
            question: entry.question,
            summary: entry.summary,
            detail: entry.detail,
            tagIds,
          },
        });
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
  }, [id, authLoading, user]);

  const handleSubmit = useCallback(
    async (input: KnowledgeFormInput) => {
      await updateKnowledge(id, input);
      // Stay on this page; KnowledgeForm refreshes its dirty baseline and
      // shows a saved-flash.
    },
    [id]
  );

  const handleDelete = useCallback(async () => {
    if (deleting) return;
    if (!window.confirm("Delete this entry? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await deleteKnowledge(id);
      router.push("/apps/knowledge-base");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
      setDeleting(false);
    }
  }, [id, deleting, router]);

  if (authLoading || !user) {
    return (
      <div className={sharedStyles.page}>
        <p>Loading...</p>
      </div>
    );
  }

  if (state.kind === "notFound") {
    return (
      <div className={sharedStyles.page}>
        <div className={styles.header}>
          <Link
            href="/apps/knowledge-base"
            className={styles.backLink}
            aria-label="Back to Knowledge Base"
          >
            ←
          </Link>
          <h1 className={sharedStyles.title}>Entry not found</h1>
        </div>
        <p className={sharedStyles.description}>
          No knowledge entry exists with id <code>{id}</code>.
        </p>
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className={sharedStyles.page}>
        <p className={sharedStyles.description}>{state.message}</p>
      </div>
    );
  }

  if (state.kind === "loading") {
    return (
      <div className={sharedStyles.page}>
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div className={sharedStyles.page}>
      <div className={styles.header}>
        <Link
          href="/apps/knowledge-base"
          className={styles.backLink}
          aria-label="Back to Knowledge Base"
        >
          ←
        </Link>
        <h1 className={sharedStyles.title}>Edit Entry</h1>
      </div>
      <KnowledgeForm
        initial={state.initial}
        submitLabel="Save changes"
        onSubmit={handleSubmit}
        onCancel={() => router.push("/apps/knowledge-base")}
        extraActions={
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        }
      />
    </div>
  );
}
