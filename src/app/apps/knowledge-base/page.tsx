"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { usePageTitle } from "@/hooks/usePageTitle";
import type { KnowledgeListItem, Tag } from "@/lib/supabase/types";
import { listKnowledge } from "./_form/api";
import { listTags } from "./tags/api";
import { TagBreadcrumb } from "./_form/TagBreadcrumb";
import { TagPills } from "./_form/TagPills";
import { formatDate } from "./_form/format";
import {
  TOPICS_PARAM,
  CONCEPTS_PARAM,
  buildKnowledgeQuery,
  toggleString,
} from "./_form/filterParams";
import sharedStyles from "../../shared-page.module.css";
import styles from "./page.module.css";

const PAGE_SIZE = 20;

export default function KnowledgeBasePage() {
  return (
    <Suspense fallback={null}>
      <KnowledgeBasePageInner />
    </Suspense>
  );
}

function KnowledgeBasePageInner() {
  usePageTitle("Knowledge Base");

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const topicNames = useMemo(
    () => searchParams.getAll(TOPICS_PARAM),
    [searchParams]
  );
  const conceptNames = useMemo(
    () => searchParams.getAll(CONCEPTS_PARAM),
    [searchParams]
  );
  const hasFilters = topicNames.length > 0 || conceptNames.length > 0;

  const [tags, setTags] = useState<Tag[]>([]);
  const [tagsLoaded, setTagsLoaded] = useState(false);
  const [items, setItems] = useState<KnowledgeListItem[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tagsByName = useMemo(() => {
    const m = new Map<string, Tag>();
    for (const t of tags) m.set(t.name, t);
    return m;
  }, [tags]);

  const tagsById = useMemo(() => {
    const m = new Map<string, Tag>();
    for (const t of tags) m.set(t.id, t);
    return m;
  }, [tags]);

  const topicIds = useMemo(
    () =>
      topicNames
        .map((n) => tagsByName.get(n)?.id)
        .filter((id): id is string => !!id),
    [topicNames, tagsByName]
  );
  const conceptIds = useMemo(
    () =>
      conceptNames
        .map((n) => tagsByName.get(n)?.id)
        .filter((id): id is string => !!id),
    [conceptNames, tagsByName]
  );

  const topicIdsKey = topicIds.join(",");
  const conceptIdsKey = conceptIds.join(",");
  const knowledgeFetchReady = !hasFilters || tagsLoaded;

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
      .then((all) => {
        if (controller.signal.aborted) return;
        setTags(all);
        setTagsLoaded(true);
      })
      .catch((err: Error) => {
        if (controller.signal.aborted) return;
        setError(err.message);
        setTagsLoaded(true);
      });
    return () => controller.abort();
  }, [authLoading, user]);

  useEffect(() => {
    if (authLoading || !user) return;
    if (!knowledgeFetchReady) return;
    const controller = new AbortController();
    listKnowledge({ offset: 0, limit: PAGE_SIZE, topicIds, conceptIds })
      .then((page) => {
        if (controller.signal.aborted) return;
        setItems(page.items);
        setOffset(PAGE_SIZE);
        setHasMore(page.hasMore);
        setError(null);
      })
      .catch((err: Error) => {
        if (controller.signal.aborted) return;
        setError(err.message);
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        setLoading(false);
      });
    return () => controller.abort();
  }, [
    authLoading,
    user,
    knowledgeFetchReady,
    topicIdsKey,
    conceptIdsKey,
    topicIds,
    conceptIds,
  ]);

  const topics = useMemo(() => tags.filter((t) => t.type === "topic"), [tags]);
  const concepts = useMemo(
    () => tags.filter((t) => t.type === "concept"),
    [tags]
  );

  const updateFilters = (
    nextTopicNames: string[],
    nextConceptNames: string[]
  ) => {
    setLoading(true);
    const url =
      pathname + buildKnowledgeQuery(nextTopicNames, nextConceptNames);
    router.replace(url, { scroll: false });
  };

  const handleToggleTopic = (id: string) => {
    const tag = tagsById.get(id);
    if (!tag) return;
    updateFilters(toggleString(topicNames, tag.name), conceptNames);
  };

  const handleToggleConcept = (id: string) => {
    const tag = tagsById.get(id);
    if (!tag) return;
    updateFilters(topicNames, toggleString(conceptNames, tag.name));
  };

  const handleClearFilters = () => {
    updateFilters([], []);
  };

  const handleLoadMore = () => {
    setLoadingMore(true);
    listKnowledge({
      offset,
      limit: PAGE_SIZE,
      topicIds,
      conceptIds,
    })
      .then((page) => {
        setItems((prev) => [...prev, ...page.items]);
        setOffset((prev) => prev + PAGE_SIZE);
        setHasMore(page.hasMore);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoadingMore(false));
  };

  if (authLoading || !user) {
    return (
      <div className={sharedStyles.page}>
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div className={sharedStyles.page}>
      <h1 className={sharedStyles.title}>Knowledge Base</h1>

      <div className={styles.toolbar}>
        <Link
          href="/apps/knowledge-base/create"
          className={`${styles.toolbarBtn} ${styles.toolbarBtnPrimary}`}
        >
          + New entry
        </Link>
        <Link href="/apps/knowledge-base/tags" className={styles.toolbarBtn}>
          Tags
        </Link>
        <Link href="/resources" className={styles.toolbarBtn}>
          Resources
        </Link>
      </div>

      {(topics.length > 0 || concepts.length > 0) && (
        <div className={styles.filters}>
          {topics.length > 0 && (
            <div className={styles.filterRow}>
              <span className={styles.filterLabel}>Topics</span>
              <TagPills
                tags={topics}
                selectedIds={topicIds}
                onToggle={handleToggleTopic}
                variant="topic"
              />
            </div>
          )}
          {concepts.length > 0 && (
            <div className={styles.filterRow}>
              <span className={styles.filterLabel}>Concepts</span>
              <TagPills
                tags={concepts}
                selectedIds={conceptIds}
                onToggle={handleToggleConcept}
                variant="concept"
              />
            </div>
          )}
          <div className={styles.clearFiltersRow} aria-hidden={!hasFilters}>
            <button
              type="button"
              className={styles.clearFilters}
              onClick={handleClearFilters}
              disabled={!hasFilters}
              tabIndex={hasFilters ? 0 : -1}
            >
              Clear filters
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className={styles.note}>Loading…</p>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : items.length === 0 ? (
        <p className={styles.note}>
          {hasFilters
            ? "No entries match the current filters."
            : "No entries yet. Create your first entry."}
        </p>
      ) : (
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={`/apps/knowledge-base/${item.id}`}
                className={styles.card}
              >
                <h2 className={styles.question}>{item.question}</h2>
                <div className={styles.cardFooter}>
                  <TagBreadcrumb tags={item.tags} />
                  <span className={styles.date}>
                    {formatDate(item.created_at)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {hasMore && !loading && !error && (
        <button
          type="button"
          className={styles.loadMore}
          onClick={handleLoadMore}
          disabled={loadingMore}
        >
          {loadingMore ? "Loading…" : "Load more"}
        </button>
      )}
    </div>
  );
}
