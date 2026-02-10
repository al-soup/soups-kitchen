"use client";

import { useLayoutEffect } from "react";
import { usePageContext } from "@/context/PageContext";

export function usePageTitle(title: string, subtitle?: string) {
  const { setPageInfo } = usePageContext();

  useLayoutEffect(() => {
    setPageInfo(title, subtitle);
    return () => setPageInfo("");
  }, [title, subtitle, setPageInfo]);
}
