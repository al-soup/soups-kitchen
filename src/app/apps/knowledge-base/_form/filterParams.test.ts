import {
  buildKnowledgeQuery,
  toggleString,
  TOPICS_PARAM,
  CONCEPTS_PARAM,
} from "./filterParams";

describe("buildKnowledgeQuery", () => {
  it("returns empty string when both lists empty", () => {
    expect(buildKnowledgeQuery([], [])).toBe("");
  });

  it("uses repeated params (multi-value)", () => {
    const q = buildKnowledgeQuery(["Databases", "Networking"], []);
    expect(q).toBe(`?${TOPICS_PARAM}=Databases&${TOPICS_PARAM}=Networking`);
  });

  it("includes both topic and concept params", () => {
    const q = buildKnowledgeQuery(["Databases"], ["DB Indexing"]);
    expect(q).toContain(`${TOPICS_PARAM}=Databases`);
    expect(q).toContain(`${CONCEPTS_PARAM}=DB+Indexing`);
    expect(q.startsWith("?")).toBe(true);
  });

  it("encodes special characters in names", () => {
    const q = buildKnowledgeQuery(["A&B", "C D"], []);
    const parsed = new URLSearchParams(q.slice(1));
    expect(parsed.getAll(TOPICS_PARAM)).toEqual(["A&B", "C D"]);
  });
});

describe("toggleString", () => {
  it("adds value when absent", () => {
    expect(toggleString(["a"], "b")).toEqual(["a", "b"]);
  });

  it("removes value when present", () => {
    expect(toggleString(["a", "b"], "a")).toEqual(["b"]);
  });

  it("works on empty list", () => {
    expect(toggleString([], "a")).toEqual(["a"]);
  });
});
