"use client";

import { useEffect } from "react";
import { usePageContext } from "@/context/PageContext";

export function usePageTitle(title: string, subtitle?: string) {
  const { setPageInfo } = usePageContext();

  useEffect(() => {
    setPageInfo(title, subtitle);
    return () => setPageInfo("Soup's Kitchen");
  }, [title, subtitle, setPageInfo]);
}
