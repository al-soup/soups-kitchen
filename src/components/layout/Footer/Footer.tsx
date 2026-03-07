import { GitHubIcon, LinkedInIcon } from "@/constants/icons";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.links}>
        <a
          href="https://www.linkedin.com/in/alex-kraeuchi/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          className={styles.link}
        >
          <LinkedInIcon />
        </a>
        <a
          href="https://github.com/al-soup"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          className={styles.link}
        >
          <GitHubIcon />
        </a>
      </div>
    </footer>
  );
}
