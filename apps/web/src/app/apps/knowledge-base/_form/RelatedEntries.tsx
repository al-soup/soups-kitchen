"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { RelatedKnowledge } from "@/lib/supabase/types";
import { listRelatedKnowledge } from "./api";
import { TagBreadcrumb } from "./TagBreadcrumb";
import styles from "./RelatedEntries.module.css";

const MarkdownInline = dynamic(
  () => import("./MarkdownInline").then((m) => m.MarkdownInline),
  { ssr: false, loading: () => null }
);

interface RelatedEntriesProps {
  entryId: number;
}

export function RelatedEntries({ entryId }: RelatedEntriesProps) {
  const [related, setRelated] = useState<RelatedKnowledge[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    listRelatedKnowledge(entryId)
      .then((rows) => {
        if (!cancelled) setRelated(rows);
      })
      // Related entries are a convenience; a failure just leaves the footer
      // with the "All entries" link.
      .catch(() => {
        if (!cancelled) setRelated([]);
      });
    return () => {
      cancelled = true;
    };
  }, [entryId]);

  return (
    <footer className={styles.footer} data-testid="kb-related">
      {related && related.length > 0 && (
        <nav aria-label="Related entries">
          <h2 className={styles.kicker}>Related</h2>
          <ul className={styles.list}>
            {related.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/apps/knowledge-base/${item.id}`}
                  className={styles.item}
                >
                  <span className={styles.question}>
                    <MarkdownInline source={item.question} />
                  </span>
                  <TagBreadcrumb tags={item.tags} size="xs" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <Link href="/apps/knowledge-base" className={styles.allLink}>
        All entries →
      </Link>
    </footer>
  );
}
