"use client";

import Link from "next/link";
import { PageTitle } from "@/components/ui/PageTitle";
import styles from "../shared-page.module.css";

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <PageTitle title="About" />
      <h1 className={styles.title}>About</h1>
      <nav style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Link href="/about/experience">Experience</Link>
        <Link href="/about/me">Me</Link>
      </nav>
    </div>
  );
}
