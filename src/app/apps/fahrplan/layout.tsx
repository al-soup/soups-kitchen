import { AppFrame } from "@/components/layout/AppFrame";
import { appMetadata, appViewport } from "@/lib/appPwa";

export const metadata = appMetadata("fahrplan");
export const viewport = appViewport("fahrplan");

export default function FahrplanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppFrame slug="fahrplan">{children}</AppFrame>;
}
