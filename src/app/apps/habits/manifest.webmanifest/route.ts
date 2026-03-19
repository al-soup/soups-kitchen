import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json(
    {
      name: "Habits — Soup's Kitchen",
      short_name: "Habits",
      start_url: "/apps/habits",
      scope: "/apps/habits",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#171717",
      icons: [
        { src: "/icons/habits-192.png", sizes: "192x192", type: "image/png" },
        { src: "/icons/habits-512.png", sizes: "512x512", type: "image/png" },
      ],
    },
    { headers: { "Content-Type": "application/manifest+json" } },
  );
}
