import { topicColorFor } from "./topicColor";

// Topics in use: prod (2026-09) + supabase/seed.sql.
const TOPICS_IN_USE = [
  "Algorithms",
  "CS",
  "Data Structures",
  "Databases",
  "DevOps",
  "Go",
  "Java",
  "System Design",
  "TypeScript",
  "Web",
  "Web Development",
];

describe("topicColorFor", () => {
  it("gives every topic in use its own swatch", () => {
    const solids = TOPICS_IN_USE.map((name) => topicColorFor(name).solid);
    expect(new Set(solids).size).toBe(TOPICS_IN_USE.length);
  });

  it("is stable and case-insensitive", () => {
    expect(topicColorFor("DevOps")).toBe(topicColorFor("devops"));
  });

  it("falls back to the first swatch without a name", () => {
    expect(topicColorFor(null)).toBe(topicColorFor(undefined));
  });
});
