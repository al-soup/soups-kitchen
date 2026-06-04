"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ActionType, HabitDetail } from "@/lib/supabase/types";
import { useUserRole } from "@/hooks/useUserRole";
import { getLocalToday } from "@/lib/dateUtils";
import { getHabitFeed, PAGE_SIZE } from "./api";
import { HabitFeedItem } from "./HabitFeedItem";
import styles from "./HabitFeed.module.css";

type DateGroup = { date: string; label: string; habits: HabitDetail[] };

function formatDateLabel(date: string): string {
  const base = new Date(date + "T12:00:00").toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return date === getLocalToday() ? `${base} (Today)` : base;
}

function groupByDate(items: HabitDetail[]): DateGroup[] {
  const map = new Map<string, HabitDetail[]>();
  for (const item of items) {
    const date = (item.completed_at ?? item.created_at).split("T")[0];
    if (!map.has(date)) map.set(date, []);
    map.get(date)!.push(item);
  }
  return Array.from(map.entries()).map(([date, habits]) => ({
    date,
    label: formatDateLabel(date),
    habits,
  }));
}

export function HabitFeed({
  actionType,
  selectedDate,
  onClearDate,
}: {
  actionType: ActionType;
  selectedDate?: string | null;
  onClearDate?: () => void;
}) {
  const [items, setItems] = useState<HabitDetail[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { role } = useUserRole("habit");
  const showDetailLink = role === "admin" || role === "manager";

  const epochRef = useRef(0);
  const loadMoreCtrlRef = useRef<AbortController | null>(null);

  useEffect(() => {
    epochRef.current += 1;
    loadMoreCtrlRef.current?.abort();
    const myEpoch = epochRef.current;
    const controller = new AbortController();

    getHabitFeed({
      actionType,
      offset: 0,
      date: selectedDate,
      signal: controller.signal,
    })
      .then((page) => {
        if (controller.signal.aborted || epochRef.current !== myEpoch) return;
        setItems(page.items);
        setOffset(PAGE_SIZE);
        setHasMore(page.hasMore);
      })
      .catch((err) => {
        if (controller.signal.aborted || epochRef.current !== myEpoch) return;
        setError(err.message);
      })
      .finally(() => {
        if (controller.signal.aborted || epochRef.current !== myEpoch) return;
        setLoading(false);
      });

    return () => controller.abort();
  }, [actionType, selectedDate]);

  const handleLoadMore = () => {
    const myEpoch = epochRef.current;
    const controller = new AbortController();
    loadMoreCtrlRef.current = controller;
    setLoadingMore(true);
    getHabitFeed({
      actionType,
      offset,
      date: selectedDate,
      signal: controller.signal,
    })
      .then((page) => {
        if (controller.signal.aborted || epochRef.current !== myEpoch) return;
        setItems((prev) => [...prev, ...page.items]);
        setOffset((prev) => prev + PAGE_SIZE);
        setHasMore(page.hasMore);
      })
      .catch((err) => {
        if (controller.signal.aborted || epochRef.current !== myEpoch) return;
        setError(err.message);
      })
      .finally(() => {
        if (controller.signal.aborted || epochRef.current !== myEpoch) return;
        setLoadingMore(false);
      });
  };

  const groups = useMemo(() => groupByDate(items), [items]);

  if (loading) {
    return <div className={styles.emptyState}>Loading…</div>;
  }

  if (error) {
    return <div className={styles.emptyState}>{error}</div>;
  }

  const filterLabel = selectedDate ? formatDateLabel(selectedDate) : null;

  return (
    <div className={styles.feed}>
      {filterLabel && (
        <div className={styles.filterChip}>
          <span>{filterLabel}</span>
          <button
            className={styles.filterChipClear}
            onClick={onClearDate}
            aria-label="Clear date filter"
          >
            ✕
          </button>
        </div>
      )}
      {groups.length === 0 ? (
        <div className={styles.emptyState}>
          {filterLabel
            ? `No habits recorded on ${filterLabel}.`
            : "No habits recorded."}
        </div>
      ) : (
        groups.map((group) => (
          <section key={group.date} id={`feed-date-${group.date}`}>
            <h3 className={styles.dateHeader}>{group.label}</h3>
            {group.habits.map((h) => (
              <HabitFeedItem
                key={h.id}
                habit={h}
                showDetailLink={showDetailLink}
              />
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
