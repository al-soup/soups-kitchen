"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface PageContextValue {
  title: string;
  subtitle?: string;
  setPageInfo: (title: string, subtitle?: string) => void;
}

const PageContext = createContext<PageContextValue | undefined>(undefined);

export function PageProvider({ children }: { children: React.ReactNode }) {
  const [title, setTitle] = useState("Soup's Kitchen");
  const [subtitle, setSubtitle] = useState<string | undefined>();

  const setPageInfo = useCallback((newTitle: string, newSubtitle?: string) => {
    setTitle(newTitle);
    setSubtitle(newSubtitle);
  }, []);

  return (
    <PageContext.Provider value={{ title, subtitle, setPageInfo }}>
      {children}
    </PageContext.Provider>
  );
}

export function usePageContext() {
  const context = useContext(PageContext);
  if (!context) {
    throw new Error("usePageContext must be used within PageProvider");
  }
  return context;
}
