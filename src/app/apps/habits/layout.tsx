import { AppFrame } from "@/components/layout/AppFrame";
import { appMetadata, appViewport } from "@/lib/appPwa";

export const metadata = appMetadata("habits");
export const viewport = appViewport("habits");

export default function HabitsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppFrame slug="habits">{children}</AppFrame>;
}
