"use client";

import { useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { MenuButton } from "@/components/ui/MenuButton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Navbar } from "../Navbar";
import { Drawer, DRAWER_ID } from "../Drawer";
import styles from "./Shell.module.css";

interface ShellProps {
  children: React.ReactNode;
}

export function Shell({ children }: ShellProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const toggleDrawer = useCallback(() => setIsDrawerOpen((prev) => !prev), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const isLanding = usePathname() === "/";

  const controlsClass = [
    styles.controls,
    isLanding ? styles.controlsLanding : "",
    isDrawerOpen ? styles.controlsPinned : "",
  ].join(" ");

  return (
    <>
      {!isLanding && <Navbar />}
      <div className={controlsClass}>
        <ThemeToggle />
        <MenuButton
          isOpen={isDrawerOpen}
          onClick={toggleDrawer}
          controls={DRAWER_ID}
        />
      </div>
      <Drawer isOpen={isDrawerOpen} onClose={closeDrawer} />
      <div className={`${styles.shell} ${isLanding ? styles.noNavbar : ""}`}>
        <main className={styles.main}>{children}</main>
      </div>
    </>
  );
}
