"use client";

import Image from "next/image";
import styles from "./Navbar.module.css";
import { ProfileDropdown } from "../ProfileDropdown/ProfileDropdown";

interface NavbarProps {
  subtitle?: string;
  onMenuClick: () => void;
}

export function Navbar({ subtitle, onMenuClick }: NavbarProps) {
  return (
    <header className={styles.navbar}>
      <button
        className={styles.menuButton}
        onClick={onMenuClick}
        aria-label="Toggle menu"
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
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <div className={styles.brand}>
        <Image
          src="/soup.svg"
          alt="Soup's Kitchen logo"
          width={36}
          height={36}
          className={styles.logo}
          priority
        />
        <div className={styles.titles}>
          <h1 className={styles.title}>Soup&apos;s Kitchen</h1>
          {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
        </div>
      </div>

      <ProfileDropdown />
    </header>
  );
}
