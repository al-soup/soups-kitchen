import Link from "next/link";
import { PageTitle } from "@/components/ui/PageTitle";
import styles from "./page.module.css";

export default function AppsPage() {
  return (
    <div className={styles.page}>
      <PageTitle title="Apps" />
      <h1 className={styles.heading}>Apps</h1>
      <nav className={styles.list}>
        <Link href="/apps/habits" className={styles.appLink}>
          <p className={styles.linkTitle}>Habit Tracker</p>
          <p className={styles.linkDesc}>Track daily habits & streaks</p>
        </Link>
        <Link href="/apps/fahrplan" className={styles.appLink}>
          <p className={styles.linkTitle}>Fahrplan</p>
          <p className={styles.linkDesc}>Swiss public transport departures</p>
        </Link>
      </nav>
    </div>
  );
}
