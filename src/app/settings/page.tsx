"use client";

import { usePageTitle } from "@/hooks/usePageTitle";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import styles from "./page.module.css";

export default function SettingsPage() {
  usePageTitle("Settings");

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Settings</h1>
      <div className={styles.section}>
        <ThemeSwitcher />
      </div>
    </div>
  );
}
