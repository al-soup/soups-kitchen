"use client";

import { usePageTitle } from "@/hooks/usePageTitle";
import styles from "./page.module.css";

export default function Home() {
  usePageTitle("Soup's Kitchen");

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Welcome to Soup&apos;s Kitchen</h1>
      <p className={styles.description}>
        A multi-app platform hosting small tools and portfolio.
      </p>
    </div>
  );
}
