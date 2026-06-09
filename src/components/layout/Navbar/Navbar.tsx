"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePageContext } from "@/context/PageContext";
import {
  MenuIcon,
  HabitsAppIcon,
  FahrplanAppIcon,
  KnowledgeBaseAppIcon,
  FragespielAppIcon,
} from "@/constants/icons";
import styles from "./Navbar.module.css";
import { ProfileDropdown } from "../ProfileDropdown";

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { title, subtitle, hideBrand } = usePageContext();
  const pathname = usePathname() ?? "";
  const AppIcon = pathname.startsWith("/apps/habits")
    ? HabitsAppIcon
    : pathname.startsWith("/apps/fahrplan")
      ? FahrplanAppIcon
      : pathname.startsWith("/apps/knowledge-base")
        ? KnowledgeBaseAppIcon
        : pathname.startsWith("/apps/fragespiel")
          ? FragespielAppIcon
          : null;

  return (
    <header className={styles.navbar}>
      <button
        className={styles.menuButton}
        onClick={onMenuClick}
        aria-label="Toggle menu"
      >
        <MenuIcon />
      </button>

      <Link
        href="/"
        className={`${styles.brand} ${hideBrand ? styles.brandHidden : ""}`}
      >
        {AppIcon ? (
          <span className={styles.logo} aria-hidden="true">
            <AppIcon size={36} />
          </span>
        ) : (
          <Image
            src="/soup.svg"
            alt="Soup's Kitchen logo"
            width={36}
            height={36}
            className={styles.logo}
            loading="eager"
          />
        )}
        {title && (
          <div className={styles.titles}>
            <span className={styles.title}>{title}</span>
            {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
          </div>
        )}
      </Link>

      <ProfileDropdown />
    </header>
  );
}
