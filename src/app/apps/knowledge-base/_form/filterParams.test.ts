import {
  buildKnowledgeQuery,
  toggleString,
  TOPICS_PARAM,
  CONCEPTS_PARAM,
  Q_PARAM,
} from "./filterParams";

describe("buildKnowledgeQuery", () => {
  it("returns empty string when all inputs empty", () => {
    expect(buildKnowledgeQuery([], [], "")).toBe("");
  });

  it("uses repeated params for tag names", () => {
    const q = buildKnowledgeQuery(["Databases", "Networking"], [], "");
    expect(q).toBe(`?${TOPICS_PARAM}=Databases&${TOPICS_PARAM}=Networking`);
  });

  it("includes topic and concept params", () => {
    const q = buildKnowledgeQuery(["Databases"], ["DB Indexing"], "");
    expect(q).toContain(`${TOPICS_PARAM}=Databases`);
    expect(q).toContain(`${CONCEPTS_PARAM}=DB+Indexing`);
    expect(q.startsWith("?")).toBe(true);
  });

  it("includes q param when set", () => {
    const url = buildKnowledgeQuery([], [], "indexing");
    expect(url).toBe(`?${Q_PARAM}=indexing`);
  });

  it("trims q before including", () => {
    const url = buildKnowledgeQuery([], [], "  indexing  ");
    expect(url).toBe(`?${Q_PARAM}=indexing`);
  });

  it("omits q when only whitespace", () => {
    expect(buildKnowledgeQuery([], [], "   ")).toBe("");
  });

  it("combines tags + q", () => {
    const url = buildKnowledgeQuery(["Databases"], ["DB Indexing"], "btree");
    expect(url).toContain(`${TOPICS_PARAM}=Databases`);
    expect(url).toContain(`${CONCEPTS_PARAM}=DB+Indexing`);
    expect(url).toContain(`${Q_PARAM}=btree`);
  });

  it("encodes special characters in names", () => {
    const url = buildKnowledgeQuery(["A&B", "C D"], [], "");
    const parsed = new URLSearchParams(url.slice(1));
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
