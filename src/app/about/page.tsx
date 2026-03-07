import Link from "next/link";
import { PageTitle } from "@/components/ui/PageTitle";
import styles from "./page.module.css";

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <PageTitle title="About" />
      <h1 className={styles.heading}>About</h1>
      <nav className={styles.list}>
        <Link href="/about/me" className={styles.link}>
          <p className={styles.linkTitle}>Me</p>
          <p className={styles.linkDesc}>CV, languages & interests</p>
        </Link>
        <Link href="/about/experience" className={styles.link}>
          <p className={styles.linkTitle}>Experience</p>
          <p className={styles.linkDesc}>Work history & education</p>
        </Link>
      </nav>
    </div>
  );
}
