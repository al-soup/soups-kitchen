import Link from "next/link";
import { PageTitle } from "@/components/ui/PageTitle";
import { APPS, appPath } from "@/constants/apps";
import styles from "./page.module.css";

export default function AppsPage() {
  return (
    <div className={styles.page}>
      <PageTitle title="Apps" />
      <h1 className={styles.heading}>Apps</h1>
      <nav className={styles.list}>
        {APPS.map(({ slug, name, description, Icon }) => (
          <Link key={slug} href={appPath(slug)} className={styles.appLink}>
            <span className={styles.icon} aria-hidden="true">
              <Icon size={32} />
            </span>
            <span className={styles.text}>
              <p className={styles.linkTitle}>{name}</p>
              <p className={styles.linkDesc}>{description}</p>
            </span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
