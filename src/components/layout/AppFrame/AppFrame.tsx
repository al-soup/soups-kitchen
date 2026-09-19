import { appManifestPath } from "@/lib/appPwa";
import styles from "./AppFrame.module.css";

interface AppFrameProps {
  slug: string;
  children: React.ReactNode;
}

export function AppFrame({ slug, children }: AppFrameProps) {
  return (
    <>
      <link rel="manifest" href={appManifestPath(slug)} />
      <div className={styles.frame}>{children}</div>
    </>
  );
}
