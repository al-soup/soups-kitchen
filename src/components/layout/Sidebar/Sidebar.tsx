"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  href: string;
  label: string;
  requiresAuth?: boolean;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const SECTIONS: NavSection[] = [
  {
    label: "About",
    items: [
      { href: "/about/experience", label: "Experience" },
      { href: "/about/me", label: "Me" },
    ],
  },
  {
    label: "Apps",
    items: [
      { href: "/apps/habits", label: "Habit Tracker" },
      { href: "/apps/fahrplan", label: "Fahrplan" },
      { href: "/apps/knowledge-base", label: "Knowledge Base" },
    ],
  },
  {
    label: "Tools",
    items: [{ href: "/resources", label: "Resources", requiresAuth: true }],
  },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const sections = useMemo(
    () =>
      SECTIONS.map((section) => ({
        ...section,
        items: section.items.filter((item) => !item.requiresAuth || !!user),
      })).filter((section) => section.items.length > 0),
    [user]
  );

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
          {sections.map((section) => (
            <div key={section.label} className={styles.section}>
              <h3 className={styles.sectionHeading}>{section.label}</h3>
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.link} ${pathname === item.href ? styles.active : ""}`}
                  onClick={onClose}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
