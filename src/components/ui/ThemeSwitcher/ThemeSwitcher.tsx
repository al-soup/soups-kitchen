"use client";

import { useTheme } from "@/hooks/useTheme";
import type { Theme } from "@/context/ThemeContext";
import { THEME_ICONS } from "@/constants/themeIcons";
import styles from "./ThemeSwitcher.module.css";

const THEMES: { value: Theme; label: string; description: string }[] = [
  { value: "light", label: "Light", description: "Clean white background" },
  { value: "dark", label: "Dark", description: "Easy on the eyes" },
  {
    value: "neo-brutalist",
    label: "Neo-Brutalist",
    description: "Bold borders, hard shadows",
  },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Theme</h2>
      <div className={styles.options}>
        {THEMES.map((t) => (
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
