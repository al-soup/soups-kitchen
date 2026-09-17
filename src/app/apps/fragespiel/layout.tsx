import { appManifestPath, appMetadata, appViewport } from "@/lib/appPwa";

export const metadata = appMetadata("fragespiel");
export const viewport = appViewport("fragespiel");

export default function FragespielLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link rel="manifest" href={appManifestPath("fragespiel")} />
      {children}
    </>
  );
}
