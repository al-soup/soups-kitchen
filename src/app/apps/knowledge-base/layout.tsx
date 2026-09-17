import { appManifestPath, appMetadata, appViewport } from "@/lib/appPwa";

export const metadata = appMetadata("knowledge-base");
export const viewport = appViewport("knowledge-base");

export default function KnowledgeBaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link rel="manifest" href={appManifestPath("knowledge-base")} />
      {children}
    </>
  );
}
