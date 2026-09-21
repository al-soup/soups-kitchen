import { PageTitle } from "@/components/ui/PageTitle";
import styles from "../../shared-page.module.css";

export default function ExperiencePage() {
  return (
    <div className={styles.page}>
      <PageTitle title="Experience" />
      <h1 className={styles.title}>Experience</h1>
      <p className={styles.description}>
        This is work in progress. I will be posting small blog entries about my
        professional journey and projects.
      </p>
      <br />
      <p>Coming soon...</p>
    </div>
  );
}
