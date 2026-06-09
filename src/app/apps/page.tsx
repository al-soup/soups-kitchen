import Link from "next/link";
import { PageTitle } from "@/components/ui/PageTitle";
import {
  HabitsAppIcon,
  FahrplanAppIcon,
  KnowledgeBaseAppIcon,
  FragespielAppIcon,
} from "@/constants/icons";
import styles from "./page.module.css";

export default function AppsPage() {
  return (
    <div className={styles.page}>
      <PageTitle title="Apps" />
      <h1 className={styles.heading}>Apps</h1>
      <nav className={styles.list}>
        <Link href="/apps/habits" className={styles.appLink}>
          <span className={styles.icon} aria-hidden="true">
            <HabitsAppIcon size={32} />
          </span>
          <span className={styles.text}>
            <p className={styles.linkTitle}>Habit Tracker</p>
            <p className={styles.linkDesc}>Track daily habits & streaks</p>
          </span>
        </Link>
        <Link href="/apps/fahrplan" className={styles.appLink}>
          <span className={styles.icon} aria-hidden="true">
            <FahrplanAppIcon size={32} />
          </span>
          <span className={styles.text}>
            <p className={styles.linkTitle}>Fahrplan</p>
            <p className={styles.linkDesc}>Swiss public transport departures</p>
          </span>
        </Link>
        <Link href="/apps/knowledge-base" className={styles.appLink}>
          <span className={styles.icon} aria-hidden="true">
            <KnowledgeBaseAppIcon size={32} />
          </span>
          <span className={styles.text}>
            <p className={styles.linkTitle}>Knowledge Base</p>
            <p className={styles.linkDesc}>
              Q&amp;A bits, tagged by topic & concept
            </p>
          </span>
        </Link>
        <Link href="/apps/fragespiel" className={styles.appLink}>
          <span className={styles.icon} aria-hidden="true">
            <FragespielAppIcon size={32} />
          </span>
          <span className={styles.text}>
            <p className={styles.linkTitle}>Fragespiel</p>
            <p className={styles.linkDesc}>
              Philosophical questions for discussions
            </p>
          </span>
        </Link>
      </nav>
    </div>
  );
}
