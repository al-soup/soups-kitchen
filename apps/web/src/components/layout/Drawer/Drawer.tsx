"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getMenuGroups } from "@/constants/navigation";
import { LogInIcon } from "@/constants/icons";
import { getAvatarUrl } from "@/lib/avatar";
import { DirectoryMenu } from "../DirectoryMenu";
import styles from "./Drawer.module.css";

export const DRAWER_ID = "site-drawer";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Drawer({ isOpen, onClose }: DrawerProps) {
  const { user } = useAuth();

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
      <aside
        id={DRAWER_ID}
        className={`${styles.drawer} ${isOpen ? styles.open : ""}`}
        inert={!isOpen}
      >
        <DirectoryMenu
          groups={getMenuGroups({ surface: "drawer", signedIn: !!user })}
          variant="drawer"
          onNavigate={onClose}
        />

        <div className={styles.account}>
          {user ? (
            <Link
              href="/profile"
              className={styles.accountLink}
              onClick={onClose}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getAvatarUrl(user.id, 56)}
                alt=""
                className={styles.avatar}
              />
              <span className={styles.accountText}>{user.email}</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className={styles.accountLink}
              onClick={onClose}
            >
              <LogInIcon size={18} />
              <span className={styles.accountText}>login</span>
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
