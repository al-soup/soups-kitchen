"use client";

import { useEffect, useRef, useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { GitHubIcon, LinkedInIcon, MailIcon } from "@/constants/icons";
import { PillFilter } from "@/components/ui/PillFilter";
import type { PillFilterItem } from "@/components/ui/PillFilter/PillFilter";
import {
  type BulletContent,
  TECH_ICONS,
  experience,
  education,
  languages,
  interests,
} from "./data";
import styles from "./Me.module.css";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatPeriod(s: string) {
  return s.replace(/(\d{2})\/(\d{4})/g, (_, m, y) => `${MONTHS[+m - 1]} ${y}`);
}

function ExternalBadge({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.externalBadge}
    >
      {children}
      <span className={styles.externalIcon} aria-hidden>
        ↗
      </span>
    </a>
  );
}

function renderContent(content: BulletContent): React.ReactNode {
  if (typeof content === "string") return content;
  return content.map((part, i) => {
    if (typeof part === "string") return <span key={i}>{part}</span>;
    return (
      <ExternalBadge key={i} href={part.href}>
        {part.text}
      </ExternalBadge>
    );
  });
}

export default function MePage() {
  usePageTitle("Me");

  const cardsRef = useRef<HTMLDivElement>(null);
  const [logoErrors, setLogoErrors] = useState<Set<string>>(new Set());
  const [techFilter, setTechFilter] = useState<string | null>(null);

  const techItems: PillFilterItem[] = (() => {
    const counts: Record<string, number> = {};
    for (const job of experience) {
      for (const t of job.tech) {
        counts[t] = (counts[t] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([label, count]) => ({ label, count, icon: TECH_ICONS[label] }));
  })();

  const filteredExperience = techFilter
    ? experience.filter((j) => j.tech.includes(techFilter))
    : experience;

  useEffect(() => {
    const cards = cardsRef.current?.querySelectorAll<HTMLElement>(
      `.${styles.card}, .${styles.langCard}`
    );
    if (!cards) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [techFilter]);

  function handleLogoError(key: string) {
    setLogoErrors((prev) => new Set(prev).add(key));
  }

  return (
    <div className={styles.page} ref={cardsRef}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroLeft}>
            <h1 className={styles.heroName}>Alex Kräuchi</h1>
            <p className={styles.heroBirthYear}>1991 · Software Engineer</p>
            <p className={styles.heroSummary}>
              Software engineer with +7 years of experience, committed to
              continuous learning. Interdisciplinary perspective, optimistic
              approach to challenges — prioritizing user needs while writing
              clean, robust code.
            </p>
          </div>
          <div className={styles.heroRight}>
            <a href="mailto:contact@soup.one" className={styles.heroCta}>
              <MailIcon size={16} /> Contact me
            </a>
            <a
              href="https://github.com/al-soup"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.heroBtn}
            >
              <GitHubIcon size={16} /> GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/alex-kraeuchi/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.heroBtn}
            >
              <LinkedInIcon size={16} /> LinkedIn
            </a>
          </div>
        </div>
      </section>

      <div className={styles.content}>
        {/* Work Experience */}
        <section className={styles.section}>
          <p className={styles.sectionLabel}>Work Experience</p>
          <PillFilter
            items={techItems}
            value={techFilter}
            onChange={setTechFilter}
          />
          <div className={styles.timeline}>
            {filteredExperience.map((job) => {
              const key = `${job.company}-${job.period}`;
              const showLogo = job.logoUrl && !logoErrors.has(key);
              return (
                <div key={key} className={styles.card}>
                  <div className={styles.cardMarker}>
                    {showLogo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={job.logoUrl}
                        className={styles.cardLogo}
                        alt=""
                        onError={() => handleLogoError(key)}
                      />
                    ) : (
                      <div className={styles.cardDot} />
                    )}
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.cardHeader}>
                      <span className={styles.cardCompany}>
                        {job.company}
                        <span style={{ fontWeight: 400, opacity: 0.6 }}>
                          {" "}
                          — {job.location}
                        </span>
                      </span>
                      <span className={styles.cardPeriod}>
                        {formatPeriod(job.period)}
                      </span>
                    </div>
                    <p className={styles.cardRole}>{job.role}</p>
                    {job.team && <p className={styles.cardTeam}>{job.team}</p>}
                    {job.bullets.length > 0 && (
                      <ul className={styles.cardBullets}>
                        {job.bullets.map((b, i) => (
                          <li key={i}>{renderContent(b)}</li>
                        ))}
                      </ul>
                    )}
                    {job.awards.length > 0 && (
                      <div className={styles.awards}>
                        {job.awards.map((a) => (
                          <span key={a} className={styles.award}>
                            {a}
                          </span>
                        ))}
                      </div>
                    )}
                    {job.tech.length > 0 && (
                      <div className={styles.chips}>
                        {job.tech.map((t) => {
                          const Icon = TECH_ICONS[t];
                          return (
                            <span
                              key={t}
                              className={`${styles.chip} ${techFilter === t ? styles.chipHighlight : ""}`}
                            >
                              {Icon && <Icon size={14} />}
                              {t}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Education */}
        <section className={styles.section}>
          <p className={styles.sectionLabel}>Education</p>
          <div className={`${styles.timeline} ${styles.timelineEdu}`}>
            {education.map((edu) => {
              const key = `${edu.institution}-${edu.period}`;
              const showLogo = edu.logoUrl && !logoErrors.has(key);
              return (
                <div key={key} className={styles.card}>
                  <div className={styles.cardMarker}>
                    {showLogo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={edu.logoUrl!}
                        className={styles.cardLogo}
                        alt=""
                        onError={() => handleLogoError(key)}
                      />
                    ) : (
                      <div className={styles.cardDot} />
                    )}
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.cardHeader}>
                      <span className={styles.cardCompany}>
                        {edu.institution}
                      </span>
                      <span className={styles.cardPeriod}>
                        {formatPeriod(edu.period)}
                      </span>
                    </div>
                    <p className={styles.cardRole}>{edu.credential}</p>
                    {edu.detail && (
                      <p className={styles.cardThesis}>
                        {renderContent(edu.detail)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Languages */}
        <section className={styles.section}>
          <p className={styles.sectionLabel}>Languages</p>
          <div className={styles.langGrid}>
            {languages.map((lang) => (
              <div key={lang.name} className={styles.langCard}>
                <p className={styles.langName}>
                  <span className={styles.langFlag}>{lang.flag}</span>{" "}
                  {lang.name}
                </p>
                <p className={styles.langLevel}>{lang.level}</p>
                {lang.note && <p className={styles.langNote}>{lang.note}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* Interests */}
        <section className={styles.section}>
          <p className={styles.sectionLabel}>Interests</p>
          <div className={styles.interests}>
            {interests.map((item) => (
              <span key={item} className={styles.interest}>
                {item}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
