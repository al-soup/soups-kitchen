import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
  },
  icons: {
    apple: "/icons/fragespiel-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#1b2a6b",
};

export default function FragespielLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link rel="manifest" href="/apps/fragespiel/manifest.webmanifest" />
      {children}
    </>
  );
}
