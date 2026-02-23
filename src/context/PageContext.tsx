"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface PageContextValue {
  title: string;
  subtitle?: string;
  hideBrand: boolean;
  setPageInfo: (title: string, subtitle?: string) => void;
  setHideBrand: (hide: boolean) => void;
}

const PageContext = createContext<PageContextValue | undefined>(undefined);

export function PageProvider({ children }: { children: React.ReactNode }) {
  const [pageInfo, setPageInfoState] = useState<{
    title: string;
    subtitle?: string;
  }>({ title: "" });
  const [hideBrand, setHideBrand] = useState(false);

  const setPageInfo = useCallback(
    (title: string, subtitle?: string) => setPageInfoState({ title, subtitle }),
    []
  );

  const setHideBrandCb = useCallback((hide: boolean) => setHideBrand(hide), []);

  return (
    <PageContext.Provider
      value={{
        title: pageInfo.title,
        subtitle: pageInfo.subtitle,
        hideBrand,
        setPageInfo,
        setHideBrand: setHideBrandCb,
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
