"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { usePageTitle } from "@/hooks/usePageTitle";
import type { KnowledgeListItem } from "@/lib/supabase/types";
import { listKnowledge } from "./_form/api";
import { TagBreadcrumb } from "./_form/TagBreadcrumb";
import { formatDate } from "./_form/format";
import sharedStyles from "../../shared-page.module.css";
import styles from "./page.module.css";

const PAGE_SIZE = 20;

export default function KnowledgeBasePage() {
  usePageTitle("Knowledge Base");

  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();

  const [items, setItems] = useState<KnowledgeListItem[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace(`/login?redirectTo=${encodeURIComponent(pathname)}`);
    }
  }, [authLoading, user, router, pathname]);

  useEffect(() => {
    if (authLoading || !user) return;
    const controller = new AbortController();
    listKnowledge({ offset: 0, limit: PAGE_SIZE })
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
  }, [authLoading, user]);

  const handleLoadMore = () => {
    setLoadingMore(true);
    listKnowledge({ offset, limit: PAGE_SIZE })
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

      {loading ? (
        <p className={styles.note}>Loading…</p>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : items.length === 0 ? (
        <p className={styles.note}>No entries yet. Create your first entry.</p>
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
