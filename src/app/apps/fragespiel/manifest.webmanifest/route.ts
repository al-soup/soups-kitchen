import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json(
    {
      name: "Fragespiel — Soup's Kitchen",
      short_name: "Fragespiel",
      start_url: "/apps/fragespiel",
      scope: "/apps/fragespiel",
      display: "standalone",
      orientation: "portrait",
      background_color: "#efe9da",
      theme_color: "#1b2a6b",
      icons: [
        {
          src: "/icons/fragespiel-192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "/icons/fragespiel-512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
    },
    { headers: { "Content-Type": "application/manifest+json" } }
  );
}
