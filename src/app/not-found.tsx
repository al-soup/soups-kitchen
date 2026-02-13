import Link from "next/link";
import { PageTitle } from "@/components/ui/PageTitle";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <div className={styles.page}>
      <PageTitle title="Page Not Found" />
      <div className={styles.errorCode}>404</div>
      <h1 className={styles.title}>Page Not Found</h1>
      <p className={styles.description}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/" className={styles.homeLink}>
        Go Home
      </Link>
    </div>
  );
}
