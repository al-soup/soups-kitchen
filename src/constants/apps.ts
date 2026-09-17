import type { ComponentType } from "react";
import {
  FahrplanAppIcon,
  FragespielAppIcon,
  HabitsAppIcon,
  KnowledgeBaseAppIcon,
} from "@/constants/icons";

export interface AppDefinition {
  /** Directory under `src/app/apps/`; also the row label in the directory menu. */
  slug: string;
  name: string;
  description: string;
  Icon: ComponentType<{ size?: number }>;
  /** Overrides for apps with their own visual identity. */
  pwa?: {
    backgroundColor?: string;
    themeColor?: string;
    orientation?: "portrait";
  };
}

// Order here is the order in the menus and on /apps.
// A new app also needs an entry in scripts/generate-icons.mjs.
export const APPS: readonly AppDefinition[] = [
  {
    slug: "habits",
    name: "Habit Tracker",
    description: "Track daily habits & streaks",
    Icon: HabitsAppIcon,
  },
  {
    slug: "fahrplan",
    name: "Fahrplan",
    description: "Swiss public transport departures",
    Icon: FahrplanAppIcon,
  },
  {
    slug: "knowledge-base",
    name: "Knowledge Base",
    description: "Q&A bits, tagged by topic & concept",
    Icon: KnowledgeBaseAppIcon,
  },
  {
    slug: "fragespiel",
    name: "Fragespiel",
    description: "Philosophical questions for discussions",
    Icon: FragespielAppIcon,
    pwa: {
      backgroundColor: "#efe9da",
      themeColor: "#1b2a6b",
      orientation: "portrait",
    },
  },
];

export function appPath(slug: string): string {
  return `/apps/${slug}`;
}

export function getApp(slug: string): AppDefinition {
  const app = APPS.find((a) => a.slug === slug);
  if (!app) throw new Error(`Unknown app: ${slug}`);
  return app;
}

export function findAppByPathname(pathname: string): AppDefinition | undefined {
  return APPS.find(
    (a) =>
      pathname === appPath(a.slug) || pathname.startsWith(`${appPath(a.slug)}/`)
  );
}
