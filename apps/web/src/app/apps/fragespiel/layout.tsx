import { AppFrame } from "@/components/layout/AppFrame";
import { appMetadata, appViewport } from "@/lib/appPwa";

export const metadata = appMetadata("fragespiel");
export const viewport = appViewport("fragespiel");

export default function FragespielLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppFrame slug="fragespiel">{children}</AppFrame>;
}
