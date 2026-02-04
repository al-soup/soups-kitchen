"use client";

import { usePageTitle } from "@/hooks/usePageTitle";
import styles from "./page.module.css";

export default function HabitsPage() {
  usePageTitle("Habit Tracker");

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Habit Tracker</h1>
      <p className={styles.description}>
        Track your daily habits and build consistency.
      </p>
    </div>
  );
}
