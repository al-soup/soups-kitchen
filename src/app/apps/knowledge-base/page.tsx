"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useCanManage } from "@/hooks/useCanManage";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import type { KnowledgeListItem, Tag } from "@/lib/supabase/types";
import { getKnowledgeTotal, listKnowledge } from "./_form/api";
import { listTags } from "./tags/api";
import { TagBreadcrumb } from "./_form/TagBreadcrumb";
import { TagPills } from "./_form/TagPills";
import { SearchBox } from "./_form/SearchBox";
import { MarkdownSummary } from "./_form/MarkdownSummary";
import { MarkdownInline } from "./_form/MarkdownInline";
import { formatDate } from "./_form/format";
import {
  TOPICS_PARAM,
  CONCEPTS_PARAM,
  Q_PARAM,
  buildKnowledgeQuery,
  toggleString,
} from "./_form/filterParams";
import sharedStyles from "../../shared-page.module.css";
import styles from "./page.module.css";

const PAGE_SIZE = 20;
const LOAD_MORE_SKELETON_COUNT = 4;

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
  const { canManage } = useCanManage("knowledge");
  const { canManage: canManageResources } = useCanManage("resources");

  const topicNames = useMemo(
    () => searchParams.getAll(TOPICS_PARAM),
    [searchParams]
  );
  const conceptNames = useMemo(
    () => searchParams.getAll(CONCEPTS_PARAM),
    [searchParams]
  );
  const q = (searchParams.get(Q_PARAM) ?? "").trim();
  const hasFilters =
    topicNames.length > 0 || conceptNames.length > 0 || q.length > 0;

  const [tags, setTags] = useState<Tag[]>([]);
  const [tagsLoaded, setTagsLoaded] = useState(false);
  const [items, setItems] = useState<KnowledgeListItem[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [filteredCount, setFilteredCount] = useState<number | null>(null);

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
  const hasTagFilters = topicNames.length > 0 || conceptNames.length > 0;
  const knowledgeFetchReady = !hasTagFilters || tagsLoaded;

  // Bumped whenever the filter set changes. Async results (initial fetch +
  // load-more) check the epoch they captured and bail if it's stale.
  const epochRef = useRef(0);
  const loadMoreCtrlRef = useRef<AbortController | null>(null);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    getKnowledgeTotal()
      .then((n) => {
        if (controller.signal.aborted) return;
        setTotalCount(n);
      })
      .catch(() => {
        // Counter is non-critical; swallow so it doesn't replace the list error.
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!knowledgeFetchReady) return;
    epochRef.current += 1;
    loadMoreCtrlRef.current?.abort();
    const myEpoch = epochRef.current;
    const controller = new AbortController();
    listKnowledge({
      offset: 0,
      limit: PAGE_SIZE,
      topicIds,
      conceptIds,
      q,
      signal: controller.signal,
    })
      .then((page) => {
        if (controller.signal.aborted || epochRef.current !== myEpoch) return;
        setItems(page.items);
        setOffset(PAGE_SIZE);
        setHasMore(page.hasMore);
        setFilteredCount(page.total);
        setError(null);
      })
      .catch((err: Error) => {
        if (controller.signal.aborted || epochRef.current !== myEpoch) return;
        setError(err.message);
      })
      .finally(() => {
        if (controller.signal.aborted || epochRef.current !== myEpoch) return;
        setLoading(false);
      });
    return () => controller.abort();
  }, [
    knowledgeFetchReady,
    topicIdsKey,
    conceptIdsKey,
    q,
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
    nextConceptNames: string[],
    nextQ: string
  ) => {
    setLoading(true);
    const url =
      pathname + buildKnowledgeQuery(nextTopicNames, nextConceptNames, nextQ);
    router.replace(url, { scroll: false });
  };

  const handleToggleTopic = (id: string) => {
    const tag = tagsById.get(id);
    if (!tag) return;
    updateFilters(toggleString(topicNames, tag.name), conceptNames, q);
  };

  const handleToggleConcept = (id: string) => {
    const tag = tagsById.get(id);
    if (!tag) return;
    updateFilters(topicNames, toggleString(conceptNames, tag.name), q);
  };

  const handleClearFilters = () => {
    updateFilters([], [], "");
  };

  const handleSearchChange = (nextQ: string) => {
    updateFilters(topicNames, conceptNames, nextQ);
  };

  const handleLoadMore = () => {
    if (loadingMore) return;
    const myEpoch = epochRef.current;
    const controller = new AbortController();
    loadMoreCtrlRef.current = controller;
    setLoadingMore(true);
    listKnowledge({
      offset,
      limit: PAGE_SIZE,
      topicIds,
      conceptIds,
      q,
      signal: controller.signal,
    })
      .then((page) => {
        if (controller.signal.aborted || epochRef.current !== myEpoch) return;
        setItems((prev) => [...prev, ...page.items]);
        setOffset((prev) => prev + PAGE_SIZE);
        setHasMore(page.hasMore);
        setFilteredCount(page.total);
      })
      .catch((err: Error) => {
        if (controller.signal.aborted || epochRef.current !== myEpoch) return;
        setError(err.message);
      })
      .finally(() => {
        if (controller.signal.aborted || epochRef.current !== myEpoch) return;
        setLoadingMore(false);
      });
  };

  const sentinelRef = useInfiniteScroll<HTMLDivElement>({
    hasMore,
    loading: loading || loadingMore || !!error,
    onLoadMore: handleLoadMore,
  });

  return (
    <div className={styles.pageWide}>
      <h1 className={sharedStyles.title}>Knowledge Base</h1>

      <div className={styles.searchRow}>
        <SearchBox
          initialValue={q}
          onDebouncedChange={handleSearchChange}
          placeholder="Search entries…"
        />
      </div>

      <div className={styles.toolbar}>
        {canManage && (
          <>
            <Link
              href="/apps/knowledge-base/create"
              className={`${styles.toolbarBtn} ${styles.toolbarBtnPrimary}`}
            >
              + New entry
            </Link>
            <Link
              href="/apps/knowledge-base/tags"
              className={styles.toolbarBtn}
            >
              Tags
            </Link>
          </>
        )}
        {canManageResources && (
          <Link href="/resources" className={styles.toolbarBtn}>
            Resources
          </Link>
        )}
      </div>

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
          >
            Clear filters
          </button>
        </div>
      </div>

      <p className={styles.statsRow} aria-live="polite">
        {!loading && !error && totalCount !== null && filteredCount !== null
          ? hasFilters
            ? `${filteredCount} of ${totalCount} entries`
            : `${totalCount} entries`
          : " "}
      </p>

      <ul className={styles.list}>
        {loading ? (
          Array.from({ length: 10 }).map((_, i) => (
            <li
              key={`sk-${i}`}
              className={styles.skeleton}
              aria-hidden="true"
            />
          ))
        ) : error ? (
          <li className={styles.error}>{error}</li>
        ) : items.length === 0 ? (
          <li className={styles.emptyBanner}>
            {q
              ? `No entries match "${q}".`
              : hasTagFilters
                ? "No entries match the current filters."
                : canManage
                  ? "No entries yet. Create your first entry."
                  : "No entries yet."}
          </li>
        ) : (
          <>
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/apps/knowledge-base/${item.id}`}
                  className={styles.card}
                >
                  <div className={styles.cardInner}>
                    <div className={styles.cardFront}>
                      <div className={styles.cardTop}>
                        <span className={styles.date}>
                          {formatDate(item.created_at)}
                        </span>
                      </div>
                      <h2 className={styles.question}>
                        <MarkdownInline source={item.question} />
                      </h2>
                      <div className={styles.cardBottom}>
                        <TagBreadcrumb
                          tags={item.tags}
                          size="xs"
                          className={styles.cardTags}
                        />
                      </div>
                    </div>
                    <div className={styles.cardBack} aria-hidden="true">
                      <div className={styles.summary}>
                        <MarkdownSummary source={item.summary} />
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
            {loadingMore &&
              Array.from({ length: LOAD_MORE_SKELETON_COUNT }).map((_, i) => (
                <li
                  key={`sk-more-${i}`}
                  className={styles.skeleton}
                  aria-hidden="true"
                />
              ))}
          </>
        )}
      </ul>

      {hasMore && !loading && !loadingMore && !error && (
        <div
          ref={sentinelRef}
          className={styles.sentinel}
          data-testid="kb-sentinel"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
