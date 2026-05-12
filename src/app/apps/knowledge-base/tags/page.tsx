"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { usePageTitle } from "@/hooks/usePageTitle";
import type { Tag, TagType } from "@/lib/supabase/types";
import { listTags, createTag, renameTag, deleteTag } from "./api";
import { TagSection } from "./TagSection";
import sharedStyles from "../../../shared-page.module.css";
import styles from "./page.module.css";

export default function TagsAdminPage() {
  usePageTitle("Tags", "Knowledge Base");

  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();

  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace(`/login?redirectTo=${encodeURIComponent(pathname)}`);
    }
  }, [authLoading, user, router, pathname]);

  useEffect(() => {
    if (authLoading || !user) return;
    const controller = new AbortController();
    listTags()
      .then((data) => {
        if (controller.signal.aborted) return;
        setTags(data);
        setLoadError(null);
      })
      .catch((err: Error) => {
        if (controller.signal.aborted) return;
        setLoadError(err.message);
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        setLoading(false);
      });
    return () => controller.abort();
  }, [authLoading, user]);

  const handleCreate = useCallback(async (name: string, type: TagType) => {
    const created = await createTag(name, type);
    setTags((prev) =>
      [...prev, created].sort((a, b) => a.name.localeCompare(b.name))
    );
  }, []);

  const handleRename = useCallback(async (id: string, name: string) => {
    const updated = await renameTag(id, name);
    setTags((prev) =>
      prev
        .map((t) => (t.id === id ? updated : t))
        .sort((a, b) => a.name.localeCompare(b.name))
    );
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    await deleteTag(id);
    setTags((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const { topics, concepts } = useMemo(() => {
    return {
      topics: tags.filter((t) => t.type === "topic"),
      concepts: tags.filter((t) => t.type === "concept"),
    };
  }, [tags]);

  if (authLoading || !user) {
    return (
      <div className={sharedStyles.page}>
        <p>Loading...</p>
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
        <h1 className={sharedStyles.title}>Tags</h1>
      </div>
      <p className={styles.intro}>
        Topics group entries under a broad area. Concepts cross-reference
        related entries.
      </p>

      {loading && <p className={sharedStyles.description}>Loading tags...</p>}
      {loadError && <p className={styles.error}>{loadError}</p>}

      {!loading && !loadError && (
        <>
          <TagSection
            title="Topics"
            placeholder="Add a topic"
            type="topic"
            tags={topics}
            onCreate={handleCreate}
            onRename={handleRename}
            onDelete={handleDelete}
          />
          <TagSection
            title="Concepts"
            placeholder="Add a concept"
            type="concept"
            tags={concepts}
            onCreate={handleCreate}
            onRename={handleRename}
            onDelete={handleDelete}
          />
        </>
      )}
    </div>
  );
}
