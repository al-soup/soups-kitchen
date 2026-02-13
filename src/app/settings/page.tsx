"use client";

import { PageTitle } from "@/components/ui/PageTitle";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import styles from "./page.module.css";

export default function SettingsPage() {
  return (
    <div className={styles.page}>
      <PageTitle title="Settings" />
      <h1 className={styles.title}>Settings</h1>
      <div className={styles.section}>
        <ThemeSwitcher />
      </div>
    </div>
  );
}
