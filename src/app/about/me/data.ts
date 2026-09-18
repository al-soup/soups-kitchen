import type { ComponentType } from "react";
import { GitHubIcon, LinkedInIcon, MailIcon } from "@/constants/icons";

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
  /** Shown as `<display>`; the href may carry a scheme the display omits. */
  display: string;
  Icon: ComponentType<{ size?: number }>;
}

// Bump by hand when the content below changes.
export const LAST_UPDATED = "2026-09-17";

export const HEADLINE = {
  name: "alex kräuchi",
  tagline: "senior software engineer · zürich · 1991",
};

export const JOBS: Job[] = [
  {
    company: "Ambit Group",
    years: "2026 – now",
    role: "Senior Software Engineer",
    summary: "Building up competence ...",
    tech: [".NET", "node", "React", "Azure"],
  },
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
      "Building interactive visuals and data visualization software for journalists.",
    tech: ["typescript", "sveltekit", "d3", "node", "couchdb"],
  },
  {
    company: "Smallstack",
    years: "2020 – 2022",
    role: "Software Engineer · Product Owner",
    summary: "Full-stack work in a start-up building an ERP/CRM product.",
    tech: ["typescript", "angular", "nestjs", "java", "mongodb", "GCP"],
  },
  {
    company: "University of Bern",
    years: "2017 – 2020",
    role: "Software Engineer",
    summary:
      "Research and consulting projects around open source and open data.",
    tech: ["typescript", "angular", "d3", "python", "mysql"],
  },
];

export const BEFORE: string[] = [
  "M.Sc. Business Administration, University of Bern",
];

export const LIKES: string[] = [
  "road & touring bikes",
  "calisthenics",
  "board games with too many rules",
  "techno",
  "dogs",
];

export const LINKS: CvLink[] = [
  {
    label: "github",
    href: "https://github.com/al-soup",
    display: "github.com/al-soup",
    Icon: GitHubIcon,
  },
  {
    label: "linkedin",
    href: "https://www.linkedin.com/in/alex-kraeuchi/",
    display: "linkedin.com/in/alex-kraeuchi",
    Icon: LinkedInIcon,
  },
  {
    label: "mail",
    href: "mailto:contact@soup.one",
    display: "contact@soup.one",
    Icon: MailIcon,
  },
];
