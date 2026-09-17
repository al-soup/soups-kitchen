import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import { PageTitle } from "@/components/ui/PageTitle";
import { Waves } from "@/components/ui/Waves";
import { BEFORE, HEADLINE, JOBS, LAST_UPDATED, LINKS } from "./data";
import styles from "./Me.module.css";

const PORTRAIT = "/portrait.jpg";
// Evaluated at build time (static page): drop public/portrait.jpg and rebuild.
const hasPortrait = existsSync(path.join(process.cwd(), "public", PORTRAIT));

export default function MePage() {
  return (
    <article className={styles.page}>
      <PageTitle title="Me" />

      <div className={styles.waveStrip}>
        <Waves seed={33} />
      </div>

      <div className={styles.content}>
        <header
          className={`${styles.heading} ${hasPortrait ? styles.withPortrait : ""}`}
        >
          <div>
            <h1 className={styles.h1}>
              <span className={styles.hash}>#</span> {HEADLINE.name}
            </h1>
            <p className={styles.tagline}>{HEADLINE.tagline}</p>
          </div>
          {hasPortrait && (
            <Image
              src={PORTRAIT}
              alt="Portrait of Alex Kräuchi"
              width={120}
              height={150}
              className={styles.portrait}
            />
          )}
        </header>

        <section>
          <h2 className={styles.h2}>
            <span className={styles.hash}>##</span> work
          </h2>
          {JOBS.map((job) => (
            <div key={job.company} className={styles.job}>
              <h3 className={styles.h3}>
                <span className={styles.hash}>###</span> {job.company}{" "}
                <span className={styles.years}>{job.years}</span>
              </h3>
              <p className={styles.role}>_{job.role}_</p>
              <p className={styles.summary}>{job.summary}</p>
              <p className={styles.tech}>`{job.tech.join(" · ")}`</p>
            </div>
          ))}
        </section>

        <section>
          <h2 className={styles.h2}>
            <span className={styles.hash}>##</span> before
          </h2>
          <ul className={styles.plainList}>
            {BEFORE.map((line) => (
              <li key={line} className={styles.before}>
                - {line}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className={styles.h2}>
            <span className={styles.hash}>##</span> links
          </h2>
          <ul className={styles.plainList}>
            {LINKS.map((link) => (
              <li key={link.label} className={styles.linkRow}>
                - [
                <a
                  href={link.href}
                  className={styles.mdLink}
                  {...(link.href.startsWith("http") && {
                    target: "_blank",
                    rel: "noopener noreferrer",
                  })}
                >
                  {link.label}
                </a>
                ]({link.display})
              </li>
            ))}
          </ul>
        </section>

        <footer className={styles.signOff}>
          <span>last updated {LAST_UPDATED}</span>
          <Image
            src="/soup.svg"
            alt=""
            width={56}
            height={56}
            className={styles.disc}
          />
        </footer>
      </div>
    </article>
  );
}
