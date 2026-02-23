import { PageTitle } from "@/components/ui/PageTitle";
import styles from "../../shared-page.module.css";

export default function MePage() {
  return (
    <div className={styles.page}>
      <PageTitle title="Me" />
      <h1 className={styles.title}>Me</h1>
      <p className={styles.description}>My resume and qualifications.</p>
    </div>
  );
}
