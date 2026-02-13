"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { href: "/habits", label: "Habit Tracker" },
  { href: "/work/experience", label: "Experience" },
  { href: "/work/cv", label: "CV" },
  { href: "/settings", label: "Settings" },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  return (
    <>
      <div
        className={`${styles.backdrop} ${isOpen ? styles.open : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.link} ${pathname === item.href ? styles.active : ""}`}
              onClick={onClose}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
