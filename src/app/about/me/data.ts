export interface Job {
  company: string;
  years: string;
  role: string;
  summary: string;
  tech: string[];
}

export interface CvLink {
  label: string;
  href: string;
  /** Shown in parentheses, markdown style. */
  display: string;
}

// Bump by hand when the content below changes.
export const LAST_UPDATED = "2026-09-17";

export const HEADLINE = {
  name: "alex kräuchi",
  tagline: "software engineer · zürich · since 2017",
};

export const JOBS: Job[] = [
  {
    company: "Swisscom",
    years: "2025",
    role: "DevOps Engineer",
    summary:
      "CMS infrastructure for the Swiss government: backend, frontend, CI/CD.",
    tech: ["go", "node", "nuxt", "kubernetes", "gitlab ci"],
  },
  {
    company: "NZZ",
    years: "2022 – 2024",
    role: "Senior Software Engineer",
    summary:
      "Interactive visuals and election coverage; three journalism awards along the way.",
    tech: ["typescript", "sveltekit", "d3", "node", "couchdb"],
  },
  {
    company: "Smallstack",
    years: "2020 – 2022",
    role: "Software Engineer · Product Owner",
    summary:
      "Full-stack work on an ERP/CRM product, plus a contract in a frontend team at Allianz.",
    tech: ["typescript", "angular", "nestjs", "java", "mongodb"],
  },
  {
    company: "Univ. Bern, FDN",
    years: "2017 – 2020",
    role: "Software Engineer",
    summary:
      "Research and consulting projects around open source and open data.",
    tech: ["typescript", "angular", "d3", "python", "mysql"],
  },
];

export const BEFORE: string[] = [
  "M.Sc. Information Systems, Univ. Bern",
  "Swiss Press Award 2024 · European Newspaper Award 2023 · POY 2024",
];

export const LINKS: CvLink[] = [
  {
    label: "github",
    href: "https://github.com/al-soup",
    display: "github.com/al-soup",
  },
  {
    label: "linkedin",
    href: "https://www.linkedin.com/in/alex-kraeuchi/",
    display: "linkedin.com/in/alex-kraeuchi",
  },
  {
    label: "mail",
    href: "mailto:contact@soup.one",
    display: "contact@soup.one",
  },
];
