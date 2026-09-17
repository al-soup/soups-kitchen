import type { Metadata, Viewport } from "next";
import { NextResponse } from "next/server";
import { appPath, getApp } from "@/constants/apps";

const SITE_NAME = "Soup's Kitchen";
// Matches --background of the default (dark) theme in globals.css.
const DEFAULT_PWA_COLOR = "#0f0f0f";

export function appManifestPath(slug: string): string {
  return `${appPath(slug)}/manifest.webmanifest`;
}

export function appManifestResponse(slug: string): NextResponse {
  const app = getApp(slug);
  const path = appPath(slug);
  return NextResponse.json(
    {
      // Explicit id keeps the install identity stable if start_url ever changes.
      id: path,
      name: `${app.name} — ${SITE_NAME}`,
      short_name: app.name,
      description: app.description,
      start_url: path,
      scope: path,
      display: "standalone",
      ...(app.pwa?.orientation && { orientation: app.pwa.orientation }),
      background_color: app.pwa?.backgroundColor ?? DEFAULT_PWA_COLOR,
      theme_color: app.pwa?.themeColor ?? DEFAULT_PWA_COLOR,
      icons: [
        { src: `/icons/${slug}-192.png`, sizes: "192x192", type: "image/png" },
        { src: `/icons/${slug}-512.png`, sizes: "512x512", type: "image/png" },
        {
          src: `/icons/${slug}-maskable-512.png`,
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
    },
    { headers: { "Content-Type": "application/manifest+json" } }
  );
}

export function appMetadata(slug: string): Metadata {
  const app = getApp(slug);
  return {
    title: `${app.name} — ${SITE_NAME}`,
    other: {
      "mobile-web-app-capable": "yes",
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "default",
      "apple-mobile-web-app-title": app.name,
    },
    icons: { apple: `/icons/${slug}-192.png` },
  };
}

export function appViewport(slug: string): Viewport {
  return { themeColor: getApp(slug).pwa?.themeColor ?? DEFAULT_PWA_COLOR };
}
