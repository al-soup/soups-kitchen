"use client";

import { useState } from "react";
import { Navbar } from "../Navbar";
import { Sidebar } from "../Sidebar";
import { Footer } from "../Footer";
import styles from "./Shell.module.css";

interface ShellProps {
  children: React.ReactNode;
  subtitle?: string;
}

export function Shell({ children, subtitle }: ShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Navbar subtitle={subtitle} onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className={styles.main}>{children}</main>
      <Footer />
    </>
  );
}
