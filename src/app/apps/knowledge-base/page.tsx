"use client";

import Link from "next/link";
import { usePageTitle } from "@/hooks/usePageTitle";
import sharedStyles from "../../shared-page.module.css";
import styles from "./page.module.css";

export default function KnowledgeBasePage() {
  usePageTitle("Knowledge Base");

  return (
    <div className={sharedStyles.page}>
      <h1 className={sharedStyles.title}>Knowledge Base</h1>
      <p className={sharedStyles.description}>
        Q&amp;A bits grouped by topic and concept.
      </p>

      <nav className={styles.list}>
        <Link href="/apps/knowledge-base/tags" className={styles.link}>
          <p className={styles.linkTitle}>Manage Tags</p>
          <p className={styles.linkDesc}>Add and edit topics and concepts</p>
        </Link>
        <Link href="/resources" className={styles.link}>
          <p className={styles.linkTitle}>Resources</p>
          <p className={styles.linkDesc}>
            Upload files; reference via {"{{resource:<id>}}"} tokens
          </p>
        </Link>
        <div
          className={`${styles.link} ${styles.linkDisabled}`}
          aria-disabled="true"
        >
          <p className={styles.linkTitle}>Create entry</p>
          <p className={styles.linkDesc}>Coming soon</p>
        </div>
      </nav>
    </div>
  );
}
