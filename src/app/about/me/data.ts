import type { ComponentType } from "react";
import {
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

export type LinkPart = { text: string; href: string };
export type BulletContent = string | Array<string | LinkPart>;

export interface Experience {
  company: string;
  location: string;
  role: string;
  period: string;
  team?: string;
  logoUrl: string;
  bullets: BulletContent[];
  tech: string[];
  awards: string[];
}

export interface Education {
  institution: string;
  credential: string;
  period: string;
  logoUrl: string | null;
  detail: BulletContent | null;
}

export interface Language {
  name: string;
  flag: string;
  level: string;
  note: string | null;
}

export const TECH_ICONS: Record<string, ComponentType<{ size?: number }>> = {
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

export const experience: Experience[] = [
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

export const education: Education[] = [
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

export const languages: Language[] = [
  { name: "German", flag: "\u{1F1E9}\u{1F1EA}", level: "Native", note: null },
  {
    name: "English",
    flag: "\u{1F1EC}\u{1F1E7}",
    level: "C2",
    note: "TOEFL iBT 103/120",
  },
  { name: "French", flag: "\u{1F1EB}\u{1F1F7}", level: "B2", note: null },
];

export const interests = [
  "Road biking & bike-packing",
  "Board, card & strategy games",
  "Science, history & international politics",
];
