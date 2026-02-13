"use client";

import { useState, useCallback } from "react";
import { Navbar } from "../Navbar";
import { Sidebar } from "../Sidebar";
import { Footer } from "../Footer";
import styles from "./Shell.module.css";

interface ShellProps {
  children: React.ReactNode;
}

export function Shell({ children }: ShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = useCallback(
    () => setIsSidebarOpen((prev) => !prev),
    [],
  );
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);

  return (
    <>
      <Navbar onMenuClick={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <div className={styles.shell}>
        <main className={styles.main}>{children}</main>
        <Footer />
      </div>
    </>
  );
}
