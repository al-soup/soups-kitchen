import { appManifestPath, appMetadata, appViewport } from "@/lib/appPwa";

export const metadata = appMetadata("habits");
export const viewport = appViewport("habits");

export default function HabitsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link rel="manifest" href={appManifestPath("habits")} />
      {children}
    </>
  );
}
