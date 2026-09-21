"use client";

import { useThemeContext } from "@/context/ThemeContext";
import { THEME_OPTIONS } from "@/constants/theme";
import { THEME_ICONS } from "@/constants/themeIcons";
import styles from "./ThemeSwitcher.module.css";

export function ThemeSwitcher() {
  const { theme, setTheme } = useThemeContext();

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Theme</h2>
      <div className={styles.options}>
        {THEME_OPTIONS.map((t) => (
          <button
            key={t.value}
            className={`${styles.option} ${theme === t.value ? styles.active : ""}`}
            onClick={() => setTheme(t.value)}
          >
            <span className={styles.label}>
              {THEME_ICONS[t.value]}
              {t.label}
            </span>
            <span className={styles.description}>{t.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
