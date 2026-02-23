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
import {
  UserIcon,
  LogInIcon,
  SettingsIcon,
  LogOutIcon,
} from "@/constants/icons";

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
          <UserIcon />
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
                <LogInIcon />
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
            <SettingsIcon />
            Settings
          </Link>

          {user && (
            <>
              <div className={styles.divider} />
              <button className={styles.item} onClick={handleLogout}>
                <LogOutIcon />
                Log out
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
