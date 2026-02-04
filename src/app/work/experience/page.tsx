"use client";

import { usePageTitle } from "@/hooks/usePageTitle";
import styles from "./page.module.css";

export default function ExperiencePage() {
  usePageTitle("Experience");

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Experience</h1>
      <p className={styles.description}>My professional journey and projects.</p>
    </div>
  );
}
