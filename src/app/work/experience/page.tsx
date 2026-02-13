import { PageTitle } from "@/components/ui/PageTitle";
import styles from "../../shared-page.module.css";

export default function ExperiencePage() {
  return (
    <div className={styles.page}>
      <PageTitle title="Experience" />
      <h1 className={styles.title}>Experience</h1>
      <p className={styles.description}>
        My professional journey and projects.
      </p>
    </div>
  );
}
