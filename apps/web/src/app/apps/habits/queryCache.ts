"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

// Stale-while-revalidate cache for habits reads (ADR-0013). Module-level so
// it outlives page components: tracker ↔ insights and type-tab switches
// re-render from here instead of hitting Supabase again.
const FRESH_MS = 5 * 60 * 1000;

type Entry<T> = { data: T; fetchedAt: number };

const cache = new Map<string, Entry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();
const listeners = new Set<() => void>();
// Bumped by invalidation so a fetch started before it cannot repopulate
// the cache with pre-mutation data.
let version = 0;

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function load<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const running = inflight.get(key);
  if (running) return running as Promise<T>;

  const startedAt = version;
  const promise = fetcher()
    .then((data) => {
      if (startedAt === version) {
        cache.set(key, { data, fetchedAt: Date.now() });
        emit();
      }
      return data;
    })
    .finally(() => {
      inflight.delete(key);
    });
  inflight.set(key, promise);
  return promise;
}

/** Drops every cached read; call after any habit write. */
export function invalidateHabitsCache() {
  cache.clear();
  version += 1;
  emit();
}

/**
 * Cached data for `key`. Fresh entries are served without a request, stale
 * ones are served while revalidating, misses load with `loading: true`.
 * A `null` key stays loading without fetching. `fetcher` must be
 * referentially stable for a given `key`.
 */
export function useCachedQuery<T>(
  key: string | null,
  fetcher: () => Promise<T>
) {
  const entry = useSyncExternalStore(
    subscribe,
    () => (key === null ? undefined : (cache.get(key) as Entry<T> | undefined)),
    () => undefined
  );
  const currentVersion = useSyncExternalStore(
    subscribe,
    () => version,
    () => version
  );
  const [failure, setFailure] = useState<{
    key: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (key === null) return;
    const cached = cache.get(key);
    if (cached && Date.now() - cached.fetchedAt < FRESH_MS) return;

    let active = true;
    load(key, fetcher)
      .then(() => {
        if (active) setFailure(null);
      })
      .catch((err: Error) => {
        if (active) setFailure({ key, message: err.message });
      });
    return () => {
      active = false;
    };
  }, [key, fetcher, currentVersion]);

  const error = failure?.key === key ? failure.message : null;
  return {
    data: entry?.data ?? null,
    loading: entry === undefined && error === null,
    error,
  };
}
