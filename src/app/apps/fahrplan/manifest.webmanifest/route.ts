import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json(
    {
      name: "Fahrplan — Soup's Kitchen",
      short_name: "Fahrplan",
      start_url: "/apps/fahrplan",
      scope: "/apps/fahrplan",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#171717",
      icons: [
        {
          src: "/icons/fahrplan-192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "/icons/fahrplan-512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
    },
    { headers: { "Content-Type": "application/manifest+json" } }
  );
}
