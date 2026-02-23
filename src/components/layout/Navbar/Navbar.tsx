"use client";

import Image from "next/image";
import Link from "next/link";
import { usePageContext } from "@/context/PageContext";
import { MenuIcon } from "@/constants/icons";
import styles from "./Navbar.module.css";
import { ProfileDropdown } from "../ProfileDropdown";

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { title, subtitle, hideBrand } = usePageContext();

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
        <Image
          src="/soup.svg"
          alt="Soup's Kitchen logo"
          width={36}
          height={36}
          className={styles.logo}
          loading="eager"
        />
        {title && (
          <div className={styles.titles}>
            <h1 className={styles.title}>{title}</h1>
            {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
          </div>
        )}
      </Link>

      <ProfileDropdown />
    </header>
  );
}
