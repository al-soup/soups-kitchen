"use client";

import { PageTitle } from "@/components/ui/PageTitle";
import { Fragespiel } from "./Fragespiel";
import styles from "./page.module.css";

export default function FragespielPage() {
  return (
    <div className={styles.page}>
      <PageTitle title="Fragespiel" />
      <Fragespiel />
    </div>
  );
}
