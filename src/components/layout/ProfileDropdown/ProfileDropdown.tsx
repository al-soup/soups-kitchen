"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./ProfileDropdown.module.css";
import { useThemeContext } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { getSupabase } from "@/lib/supabase/client";
import { getAvatarUrl } from "@/lib/avatar";
import { THEME_OPTIONS } from "@/constants/theme";
import { THEME_ICONS } from "@/constants/themeIcons";

export function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { theme, setTheme } = useThemeContext();
  const { user } = useAuth();

  async function handleLogout() {
    try {
      await getSupabase().auth.signOut();
    } catch (e) {
      console.error("Logout failed:", e);
    }
    setIsOpen(false);
    router.push("/login");
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  const cycleTheme = () => {
    const currentIndex = THEME_OPTIONS.findIndex((t) => t.value === theme);
    const nextIndex = (currentIndex + 1) % THEME_OPTIONS.length;
    setTheme(THEME_OPTIONS[nextIndex].value);
  };

  return (
    <div className={styles.container} ref={dropdownRef}>
      {user ? (
        <button
          className={styles.trigger}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Profile menu"
          aria-expanded={isOpen}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getAvatarUrl(user.id, 40)}
            alt="Avatar"
            className={styles.avatar}
          />
        </button>
      ) : (
        <button
          className={styles.trigger}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Profile menu"
          aria-expanded={isOpen}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
          </svg>
        </button>
      )}

      {isOpen && (
        <div className={styles.dropdown}>
          {!user && (
            <>
              <Link
                href="/login"
                className={styles.item}
                onClick={() => setIsOpen(false)}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                Log in
              </Link>
              <div className={styles.divider} />
            </>
          )}

          <button
            className={styles.item}
            onClick={cycleTheme}
            data-testid="theme-toggle"
          >
            {THEME_ICONS[theme]}
            {THEME_OPTIONS.find((t) => t.value === theme)?.label}
          </button>

          <div className={styles.divider} />

          <Link
            href="/settings"
            className={styles.item}
            onClick={() => setIsOpen(false)}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Settings
          </Link>

          {user && (
            <>
              <div className={styles.divider} />
              <button className={styles.item} onClick={handleLogout}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Log out
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
