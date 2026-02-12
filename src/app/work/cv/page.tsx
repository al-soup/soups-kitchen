import { PageTitle } from "@/components/ui/PageTitle";
import styles from "./page.module.css";

export default function CVPage() {
  return (
    <div className={styles.page}>
      <PageTitle title="CV" />
      <h1 className={styles.title}>CV</h1>
      <p className={styles.description}>My resume and qualifications.</p>
    </div>
  );
}
