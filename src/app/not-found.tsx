"use client";

import Link from "next/link";
import { usePageTitle } from "@/hooks/usePageTitle";
import styles from "./not-found.module.css";

export default function NotFound() {
  usePageTitle("Page Not Found");

  return (
    <div className={styles.page}>
      <div className={styles.errorCode}>404</div>
      <h1 className={styles.title}>Page Not Found</h1>
      <p className={styles.description}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/" className={styles.homeLink}>
        Go Home
      </Link>
    </div>
  );
}
