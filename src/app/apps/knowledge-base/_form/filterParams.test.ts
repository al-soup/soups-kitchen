import {
  buildKnowledgeQuery,
  parseSort,
  toggleString,
  TOPICS_PARAM,
  CONCEPTS_PARAM,
  Q_PARAM,
  SORT_PARAM,
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

  it("omits the default sort", () => {
    expect(buildKnowledgeQuery([], [], "", "newest")).toBe("");
  });

  it("includes non-default sorts", () => {
    expect(buildKnowledgeQuery([], [], "", "topic")).toBe(
      `?${SORT_PARAM}=topic`
    );
    expect(buildKnowledgeQuery([], [], "", "oldest")).toBe(
      `?${SORT_PARAM}=oldest`
    );
  });

  it("combines sort with filters", () => {
    const url = buildKnowledgeQuery(["Databases"], [], "btree", "oldest");
    expect(url).toContain(`${TOPICS_PARAM}=Databases`);
    expect(url).toContain(`${Q_PARAM}=btree`);
    expect(url).toContain(`${SORT_PARAM}=oldest`);
  });
});

describe("parseSort", () => {
  it("accepts the known sort modes", () => {
    expect(parseSort("newest")).toBe("newest");
    expect(parseSort("oldest")).toBe("oldest");
    expect(parseSort("topic")).toBe("topic");
  });

  it("falls back to the default for unknown, empty or missing values", () => {
    expect(parseSort("bogus")).toBe("newest");
    expect(parseSort("")).toBe("newest");
    expect(parseSort(null)).toBe("newest");
    expect(parseSort(undefined)).toBe("newest");
  });

  it("round-trips through buildKnowledgeQuery", () => {
    const url = buildKnowledgeQuery([], [], "", "topic");
    const parsed = new URLSearchParams(url.slice(1));
    expect(parseSort(parsed.get(SORT_PARAM))).toBe("topic");
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
