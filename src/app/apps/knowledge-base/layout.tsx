import { AppFrame } from "@/components/layout/AppFrame";
import { appMetadata, appViewport } from "@/lib/appPwa";

export const metadata = appMetadata("knowledge-base");
export const viewport = appViewport("knowledge-base");

export default function KnowledgeBaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppFrame slug="knowledge-base">{children}</AppFrame>;
}
