"use client";

import {
  Fragment,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useCanManage } from "@/hooks/useCanManage";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { ArrowRightIcon } from "@/constants/icons";
import type { KnowledgeListItem, Tag } from "@/lib/supabase/types";
import { getKnowledgeTotal, listKnowledge } from "./_form/api";
import { listTags } from "./tags/api";
import { TagBreadcrumb } from "./_form/TagBreadcrumb";
import { TagPills } from "./_form/TagPills";
import { SearchBox } from "./_form/SearchBox";
import { SortControl } from "./_form/SortControl";
import { MarkdownSummary } from "./_form/MarkdownSummary";
import { MarkdownInline } from "./_form/MarkdownInline";
import { formatDate } from "./_form/format";
import { topicColorFor } from "./_form/topicColor";
import {
  TOPICS_PARAM,
  CONCEPTS_PARAM,
  Q_PARAM,
  SORT_PARAM,
  type KnowledgeSort,
  buildKnowledgeQuery,
  parseSort,
  toggleString,
} from "./_form/filterParams";
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
  const sort = parseSort(searchParams.get(SORT_PARAM));
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
  // Touch-only: which card has its summary revealed. Desktop uses :hover.
  const [expandedId, setExpandedId] = useState<number | null>(null);

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
      sort,
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
    sort,
    topicIds,
    conceptIds,
  ]);

  const topics = useMemo(() => tags.filter((t) => t.type === "topic"), [tags]);
  const concepts = useMemo(
    () => tags.filter((t) => t.type === "concept"),
    [tags]
  );

  const topicColor = useMemo(() => (tag: Tag) => topicColorFor(tag.name), []);

  const updateFilters = (
    nextTopicNames: string[],
    nextConceptNames: string[],
    nextQ: string,
    nextSort: KnowledgeSort = sort
  ) => {
    setLoading(true);
    const url =
      pathname +
      buildKnowledgeQuery(nextTopicNames, nextConceptNames, nextQ, nextSort);
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

  const handleSortChange = (nextSort: KnowledgeSort) => {
    if (nextSort === sort) return;
    setExpandedId(null);
    updateFilters(topicNames, conceptNames, q, nextSort);
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
      sort,
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

  const countLabel =
    !loading && !error && totalCount !== null && filteredCount !== null
      ? hasFilters
        ? `${filteredCount} of ${totalCount} entries`
        : `${totalCount} entries`
      : " ";

  return (
    <div className={styles.pageWide}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Knowledge Base</h1>
        <span
          className={styles.entries}
          aria-live="polite"
          aria-label="entry count"
        >
          {countLabel}
        </span>
      </div>

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
            <span className={styles.filterLabel}>TOPICS</span>
            <TagPills
              tags={topics}
              selectedIds={topicIds}
              onToggle={handleToggleTopic}
              variant="topic"
              colorFor={topicColor}
            />
          </div>
        )}
        {concepts.length > 0 && (
          <div className={styles.filterRow}>
            <span className={styles.filterLabel}>CONCEPTS</span>
            <TagPills
              tags={concepts}
              selectedIds={conceptIds}
              onToggle={handleToggleConcept}
              variant="concept"
            />
          </div>
        )}
        <div className={styles.filterRow}>
          <span className={styles.filterLabel}>SORT</span>
          <SortControl value={sort} onChange={handleSortChange} />
        </div>
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

      <ul className={styles.list}>
        {loading ? (
          Array.from({ length: 9 }).map((_, i) => (
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
            {items.map((item, index) => {
              const topicTag = item.tags.find((t) => t.type === "topic");
              const conceptTag = item.tags.find((t) => t.type === "concept");
              const swatch = topicColorFor(topicTag?.name);
              const crumbTags = [topicTag, conceptTag].filter(
                (t): t is Tag => !!t
              );
              const isExpanded = expandedId === item.id;
              // Grouping relies on the RPC ordering entries by topic globally,
              // so a header is due whenever the topic changes from the previous
              // entry — correct across page boundaries too.
              const groupName = item.topicName ?? null;
              const showGroupHeader =
                sort === "topic" &&
                (index === 0 ||
                  (items[index - 1]?.topicName ?? null) !== groupName);
              return (
                <Fragment key={item.id}>
                  {showGroupHeader && (
                    <li
                      className={styles.groupHeader}
                      data-testid="kb-group-header"
                    >
                      <span
                        className={styles.groupDot}
                        style={{ background: topicColorFor(groupName).solid }}
                        aria-hidden="true"
                      />
                      <span className={styles.groupName}>
                        {groupName ?? "No topic"}
                      </span>
                      <span className={styles.groupCount}>
                        {item.groupCount ?? 0}
                      </span>
                    </li>
                  )}
                  <li>
                    <article
                      className={styles.card}
                      data-expanded={isExpanded}
                      data-testid="kb-card"
                    >
                      <span
                        className={styles.spine}
                        style={{ background: swatch.solid }}
                        aria-hidden="true"
                      />
                      {/* Hover pointers only: keeps the whole card clickable.
                          Hidden from assistive tech — the Read link below is
                          the card's single exposed link. */}
                      <Link
                        href={`/apps/knowledge-base/${item.id}`}
                        className={styles.cardOverlay}
                        aria-hidden="true"
                        tabIndex={-1}
                      >
                        <span className={styles.srOnly}>Read</span>
                      </Link>
                      {/* Touch only: covers the card so a tap reveals the
                          summary instead of navigating. */}
                      <button
                        type="button"
                        className={styles.tapToggle}
                        aria-expanded={isExpanded}
                        data-testid="kb-card-toggle"
                        onClick={() =>
                          setExpandedId(isExpanded ? null : item.id)
                        }
                      >
                        <span className={styles.srOnly}>
                          {isExpanded ? "Hide summary" : "Show summary"}
                        </span>
                      </button>
                      <div className={styles.cardHeader}>
                        <TagBreadcrumb tags={crumbTags} size="sm" />
                      </div>
                      <h2 className={styles.question}>
                        <MarkdownInline source={item.question} />
                      </h2>
                      <div
                        className={styles.reveal}
                        data-testid="kb-card-reveal"
                      >
                        <div
                          className={styles.summary}
                          data-testid="kb-card-summary"
                        >
                          <MarkdownSummary source={item.summary} disableLinks />
                        </div>
                      </div>
                      <div className={styles.cardFooter}>
                        <span className={styles.date}>
                          {formatDate(item.created_at)}
                        </span>
                        <Link
                          href={`/apps/knowledge-base/${item.id}`}
                          className={styles.readCta}
                          style={{ color: swatch.solid }}
                        >
                          Read
                          <ArrowRightIcon size={14} />
                          <span className={styles.srOnly}>
                            : {item.question}
                          </span>
                        </Link>
                      </div>
                    </article>
                  </li>
                </Fragment>
              );
            })}
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
