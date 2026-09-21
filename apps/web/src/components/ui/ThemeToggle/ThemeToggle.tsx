"use client";

import { useThemeContext } from "@/context/ThemeContext";
import { THEME_ICONS } from "@/constants/themeIcons";
import styles from "./ThemeToggle.module.css";

export function ThemeToggle() {
  const { theme, setTheme } = useThemeContext();
  const next = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      className={styles.button}
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} theme`}
      data-testid="theme-toggle"
    >
      {THEME_ICONS[next]}
    </button>
  );
}
