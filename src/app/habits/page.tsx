import { PageTitle } from "@/components/ui/PageTitle";
import styles from "../shared-page.module.css";

export default function HabitsPage() {
  return (
    <div className={styles.page}>
      <PageTitle title="Habit Tracker" />
      <h1 className={styles.title}>Habit Tracker</h1>
      <p className={styles.description}>
        Track your daily habits and build consistency.
      </p>
    </div>
  );
}
