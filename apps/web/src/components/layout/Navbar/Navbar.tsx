"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePageContext } from "@/context/PageContext";
import { findAppByPathname } from "@/constants/apps";
import { SoupMarkIcon } from "@/constants/icons";
import styles from "./Navbar.module.css";

export function Navbar() {
  const { title } = usePageContext();
  const pathname = usePathname() ?? "";
  const AppIcon = findAppByPathname(pathname)?.Icon;

  const segments = pathname.split("/").filter(Boolean);
  const root = `/${segments[0] ?? ""}`;
  const leaf = segments.length > 1 ? title.toLowerCase() : "";

  return (
    <header className={styles.navbar}>
      <Link href="/" className={styles.brand} aria-label="Home">
        <SoupMarkIcon size={22} />
        <span>soup</span>
      </Link>

      {/* Inert on purpose: the brand is the only way home, index pages stay unlinked. */}
      <div className={styles.location}>
        {AppIcon && (
          <span className={styles.appIcon} aria-hidden="true">
            <AppIcon size={22} />
          </span>
        )}
        <span className={styles.breadcrumb}>
          <span className={`${styles.root} ${leaf ? styles.hasLeaf : ""}`}>
            {root}
          </span>
          {leaf && (
            <span className={styles.leaf}>
              <span className={styles.separator}> / </span>
              {leaf}
            </span>
          )}
        </span>
      </div>
    </header>
  );
}
