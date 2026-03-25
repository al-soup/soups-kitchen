"use client";

import { useEffect, useRef, useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import {
  GitHubIcon,
  LinkedInIcon,
  MailIcon,
  GoIcon,
  NodeJsIcon,
  NuxtJsIcon,
  DockerIcon,
  GitLabCIIcon,
  RedisIcon,
  KubernetesIcon,
  TypeScriptIcon,
  SvelteKitIcon,
  D3JsIcon,
  CouchDBIcon,
  GitHubCIIcon,
  AngularIcon,
  NestJSIcon,
  JavaIcon,
  MongoDBIcon,
  FlutterIcon,
  FirebaseIcon,
  PythonIcon,
  MySQLIcon,
  NativeScriptIcon,
} from "@/constants/icons";
import type { ComponentType } from "react";
import styles from "./Me.module.css";

type LinkPart = { text: string; href: string };
type BulletContent = string | Array<string | LinkPart>;

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

const TECH_ICONS: Record<string, ComponentType<{ size?: number }>> = {
  Go: GoIcon,
  "Node.js": NodeJsIcon,
  "Nuxt.js": NuxtJsIcon,
  Docker: DockerIcon,
  "GitLab CI": GitLabCIIcon,
  Redis: RedisIcon,
  Kubernetes: KubernetesIcon,
  TypeScript: TypeScriptIcon,
  SvelteKit: SvelteKitIcon,
  "D3.js": D3JsIcon,
  CouchDB: CouchDBIcon,
  "GitHub CI": GitHubCIIcon,
  Angular: AngularIcon,
  NestJS: NestJSIcon,
  Java: JavaIcon,
  MongoDB: MongoDBIcon,
  Flutter: FlutterIcon,
  Firebase: FirebaseIcon,
  Python: PythonIcon,
  MySQL: MySQLIcon,
  NativeScript: NativeScriptIcon,
};

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

const experience: {
  company: string;
  location: string;
  role: string;
  period: string;
  team?: string;
  logoUrl: string;
  bullets: BulletContent[];
  tech: string[];
  awards: string[];
}[] = [
  {
    company: "Swisscom AG",
    location: "Zurich",
    role: "DevOps Engineer",
    period: "01/2025 – 11/2025",
    logoUrl: "/logos/logo.swisscom.png",
    bullets: [
      "Implementing a scalable CMS infrastructure for the Swiss government.",
      "Back- & frontend engineering, CI/CD & automation, architectural consultation.",
      "Organization of a knowledge sharing and continuous learning group.",
    ],
    tech: [
      "Go",
      "Node.js",
      "Nuxt.js",
      "Docker",
      "GitLab CI",
      "Redis",
      "Kubernetes",
    ],
    awards: [],
  },
  {
    company: "NZZ AG",
    location: "Zurich",
    role: "Senior Software Engineer",
    period: "10/2022 – 12/2024",
    logoUrl: "/logos/logo.nzz.png",
    bullets: [
      [
        "Creation of interactive visualizations and articles (",
        { text: "nzz.ch/visuals", href: "https://www.nzz.ch/visuals" },
        ").",
      ],
      "Implementation of in-house data visualization toolbox Q.",
      "Lead of the frontend team for Swiss national election projects.",
    ],
    tech: [
      "TypeScript",
      "SvelteKit",
      "D3.js",
      "Node.js",
      "CouchDB",
      "Docker",
      "GitHub CI",
    ],
    awards: [
      "Swiss Press Award 2024",
      "European Newspaper Award 2023",
      "POY 2024",
    ],
  },
  {
    company: "Smallstack GmbH",
    location: "Munich",
    role: "Software Engineer / Product Owner / Scrum Master",
    period: "02/2020 – 07/2022",
    logoUrl: "/logos/logo.smallstack.png",
    bullets: [
      "Full-stack development on an in-house ERP/CRM product.",
      [
        "Product owner for ",
        { text: "cloud.smallstack.com", href: "https://cloud.smallstack.com" },
        ".",
      ],
      "Contractor in a frontend team at Allianz SE.",
    ],
    tech: [
      "TypeScript",
      "Angular",
      "NestJS",
      "Node.js",
      "Java",
      "MongoDB",
      "Flutter",
      "Firebase",
    ],
    awards: [],
  },
  {
    company: "Univ. Bern – Research Center for Digital Sustainability (FDN)",
    location: "Bern",
    role: "Software Engineer",
    period: "02/2017 – 01/2020",
    logoUrl: "/logos/logo.unibern.png",
    bullets: [
      "Full-stack development for research and consulting projects.",
      "Strategy and technology consulting with focus on open source and open data.",
      "Organized the Data Visualization Group Meeting and the lecture Open Data.",
    ],
    tech: [
      "TypeScript",
      "Angular",
      "D3.js",
      "Node.js",
      "NativeScript",
      "Python",
      "MySQL",
    ],
    awards: [],
  },
  {
    company: "Univ. Bern – Institute of Marketing & Management",
    location: "Bern",
    role: "IT Support & Webmaster",
    period: "09/2015 – 12/2016",
    logoUrl: "/logos/logo.unibern.png",
    bullets: [],
    tech: [],
    awards: [],
  },
];

const education: {
  institution: string;
  credential: string;
  period: string;
  logoUrl: string | null;
  detail: BulletContent | null;
}[] = [
  {
    institution: "Scrum.org",
    credential: "Scrum Master Certification",
    period: "01/2022",
    logoUrl: "/logos/logo.scrum.org.png",
    detail: null,
  },
  {
    institution: "Munich University of Applied Sciences (SCE)",
    credential: 'Certificate: "Found your own start-up"',
    period: "03/2019 – 08/2019",
    logoUrl: "/logos/logo.hsmunich.jpg",
    detail:
      "Co-founder of start-up ROKIN at the Strascheg Center for Entrepreneurship.",
  },
  {
    institution: "University of Bern",
    credential: "M.Sc. Business Administration — Information Systems",
    period: "02/2017 – 08/2019",
    logoUrl: "/logos/logo.unibern.png",
    detail:
      'Thesis: "Improving Project Selection in the Swiss Procurement Market – Enhanced Efficiency by Using Machine Learning and Procurement Data"',
  },
  {
    institution: "University of Bern",
    credential: "B.Sc. Business Administration — Minor: Computer Science",
    period: "09/2013 – 09/2016",
    logoUrl: "/logos/logo.unibern.png",
    detail: [
      'Thesis: "Recommended Graph Database Implementations for Fuzzy Cognitive Maps"',
    ],
  },
  {
    institution: "University of St. Gallen",
    credential: "B.A. International Affairs (2 semesters)",
    period: "09/2012 – 06/2013",
    logoUrl: "/logos/logo.unistgallen.png",
    detail: null,
  },
  {
    institution: "Gymnasium Biel-Seeland",
    credential: "Focus: Philosophy, Psychology & Pedagogy",
    period: "08/2006 – 06/2010",
    logoUrl: "/logos/logo.gymbiel.png",
    detail: null,
  },
];

const languages = [
  { name: "German", flag: "🇩🇪", level: "Native", note: null },
  { name: "English", flag: "🇬🇧", level: "C2", note: "TOEFL iBT 103/120" },
  { name: "French", flag: "🇫🇷", level: "B2", note: null },
];

const interests = [
  "Road biking & bike-packing",
  "Board, card & strategy games",
  "Science, history & international politics",
];

export default function MePage() {
  usePageTitle("Me");

  const cardsRef = useRef<HTMLDivElement>(null);
  const [logoErrors, setLogoErrors] = useState<Set<string>>(new Set());

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
  }, []);

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
          <div className={styles.timeline}>
            {experience.map((job) => {
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
                            <span key={t} className={styles.chip}>
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
