import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import { PageTitle } from "@/components/ui/PageTitle";
import { Waves } from "@/components/ui/Waves";
import { BEFORE, HEADLINE, JOBS, LAST_UPDATED, LIKES, LINKS } from "./data";
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
            <ul className={styles.links}>
              {LINKS.map(({ label, href, display, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    className={styles.link}
                    aria-label={label}
                    {...(href.startsWith("http") && {
                      target: "_blank",
                      rel: "noopener noreferrer",
                    })}
                  >
                    <Icon size={14} />
                    <span>&lt;{display}&gt;</span>
                  </a>
                </li>
              ))}
            </ul>
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
            <span className={styles.hash}>##</span> likes
          </h2>
          <ul className={styles.plainList}>
            {LIKES.map((like) => (
              <li key={like} className={styles.like}>
                - <span className={styles.check}>[x]</span> {like}
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
