import { appManifestPath, appMetadata, appViewport } from "@/lib/appPwa";

export const metadata = appMetadata("fahrplan");
export const viewport = appViewport("fahrplan");

export default function FahrplanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link rel="manifest" href={appManifestPath("fahrplan")} />
      {children}
    </>
  );
}
