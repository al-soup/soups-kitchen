"use client";

import { usePageTitle } from "@/hooks/usePageTitle";

export function PageTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  usePageTitle(title, subtitle);
  return null;
}
