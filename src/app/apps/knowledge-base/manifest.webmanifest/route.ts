import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json(
    {
      name: "Knowledge Base — Soup's Kitchen",
      short_name: "Knowledge Base",
      start_url: "/apps/knowledge-base",
      scope: "/apps/knowledge-base",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#171717",
      icons: [
        {
          src: "/icons/knowledge-base-192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "/icons/knowledge-base-512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
    },
    { headers: { "Content-Type": "application/manifest+json" } }
  );
}
