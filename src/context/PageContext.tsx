"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface PageContextValue {
  title: string;
  subtitle?: string;
  setPageInfo: (title: string, subtitle?: string) => void;
}

const PageContext = createContext<PageContextValue | undefined>(undefined);

export function PageProvider({ children }: { children: React.ReactNode }) {
  const [pageInfo, setPageInfoState] = useState<{
    title: string;
    subtitle?: string;
  }>({ title: "" });

  const setPageInfo = useCallback(
    (title: string, subtitle?: string) => setPageInfoState({ title, subtitle }),
    []
  );

  return (
    <PageContext.Provider
      value={{
        title: pageInfo.title,
        subtitle: pageInfo.subtitle,
        setPageInfo,
      }}
    >
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
