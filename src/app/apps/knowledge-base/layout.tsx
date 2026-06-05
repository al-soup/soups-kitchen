import type { Metadata } from "next";

export const metadata: Metadata = {
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
  },
  icons: {
    apple: "/icons/knowledge-base-192.png",
  },
};

export default function KnowledgeBaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link rel="manifest" href="/apps/knowledge-base/manifest.webmanifest" />
      {children}
    </>
  );
}
