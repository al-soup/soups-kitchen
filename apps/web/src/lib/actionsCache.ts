import type { Action } from "@/lib/supabase/types";

const CACHE_KEY = "sk_actions_cache";
const TTL_MS = 24 * 60 * 60 * 1000;

type CacheEntry = {
  data: Action[];
  cachedAt: number;
};

export function getCachedActions(): Action[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.cachedAt > TTL_MS) return null;
    return entry.data;
  } catch {
    return null;
  }
}

export function setCachedActions(data: Action[]): void {
  if (typeof window === "undefined") return;
  try {
    const entry: CacheEntry = { data, cachedAt: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // ignore storage errors
  }
}
