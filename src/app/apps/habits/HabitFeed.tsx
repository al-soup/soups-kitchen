"use client";

import { useEffect, useMemo, useState } from "react";
import type { ActionType, HabitDetail } from "@/lib/supabase/types";
import { getHabitFeed, PAGE_SIZE } from "./api";
import { HabitFeedItem } from "./HabitFeedItem";
import styles from "./HabitFeed.module.css";

type DateGroup = { date: string; label: string; habits: HabitDetail[] };

function groupByDate(items: HabitDetail[]): DateGroup[] {
  const map = new Map<string, HabitDetail[]>();
  for (const item of items) {
    const date = (item.completed_at ?? item.created_at).split("T")[0];
    if (!map.has(date)) map.set(date, []);
    map.get(date)!.push(item);
  }
  return Array.from(map.entries()).map(([date, habits]) => ({
    date,
    label: new Date(date + "T12:00:00").toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    habits,
  }));
}

export function HabitFeed({ actionType }: { actionType: ActionType }) {
  const [items, setItems] = useState<HabitDetail[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    getHabitFeed({ actionType, offset: 0 })
      .then((page) => {
        if (controller.signal.aborted) return;
        setItems(page.items);
        setOffset(PAGE_SIZE);
        setHasMore(page.hasMore);
      })
      .catch((err) => {
        if (!controller.signal.aborted) setError(err.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [actionType]);

  const handleLoadMore = () => {
    setLoadingMore(true);
    getHabitFeed({ actionType, offset })
      .then((page) => {
        setItems((prev) => [...prev, ...page.items]);
        setOffset((prev) => prev + PAGE_SIZE);
        setHasMore(page.hasMore);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingMore(false));
  };

  const groups = useMemo(() => groupByDate(items), [items]);

  if (loading) {
    return <div className={styles.emptyState}>Loading…</div>;
  }

  if (error) {
    return <div className={styles.emptyState}>{error}</div>;
  }

  return (
    <div className={styles.feed}>
      {groups.length === 0 ? (
        <div className={styles.emptyState}>No habits recorded.</div>
      ) : (
        groups.map((group) => (
          <section key={group.date} id={`feed-date-${group.date}`}>
            <h3 className={styles.dateHeader}>{group.label}</h3>
            {group.habits.map((h) => (
              <HabitFeedItem key={h.id} habit={h} />
            ))}
          </section>
        ))
      )}
      {hasMore && (
        <button
          className={styles.loadMoreBtn}
          onClick={handleLoadMore}
          disabled={loadingMore}
        >
          {loadingMore ? "Loading…" : "Load more"}
        </button>
      )}
    </div>
  );
}
