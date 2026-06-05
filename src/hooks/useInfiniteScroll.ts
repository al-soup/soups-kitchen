import { useEffect, useRef } from "react";

interface UseInfiniteScrollOptions {
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  rootMargin?: string;
}

export function useInfiniteScroll<T extends HTMLElement>({
  hasMore,
  loading,
  onLoadMore,
  rootMargin = "200px",
}: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<T | null>(null);
  // Latest callback in a ref so the observer effect doesn't re-subscribe each render.
  const onLoadMoreRef = useRef(onLoadMore);
  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore || loading) return;
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          onLoadMoreRef.current();
        }
      },
      { rootMargin }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loading, rootMargin]);

  return sentinelRef;
}
