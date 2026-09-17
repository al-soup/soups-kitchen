"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MenuGroup } from "@/constants/navigation";
import styles from "./DirectoryMenu.module.css";

interface DirectoryMenuProps {
  groups: MenuGroup[];
  variant: "inline" | "drawer";
  onNavigate?: () => void;
}

export function DirectoryMenu({
  groups,
  variant,
  onNavigate,
}: DirectoryMenuProps) {
  const pathname = usePathname() ?? "";

  return (
    <nav className={`${styles.menu} ${styles[variant]}`} aria-label="Site">
      {groups.map((group) => (
        <ul key={group.label} className={styles.group}>
          {group.items.map((item, index) => {
            const isCurrent =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href} className={styles.row}>
                <span className={styles.label}>
                  {index === 0 ? group.label : ""}
                </span>
                <Link
                  href={item.href}
                  className={styles.link}
                  aria-current={isCurrent ? "page" : undefined}
                  onClick={onNavigate}
                >
                  / {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      ))}
    </nav>
  );
}
