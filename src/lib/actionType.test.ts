import {
  parseActionType,
  parseActionTypeFilter,
  actionTypeQuery,
  resolveActionTypes,
} from "./actionType";

describe("parseActionType", () => {
  it("parses '1', '2', '3' to numbers", () => {
    expect(parseActionType("1")).toBe(1);
    expect(parseActionType("2")).toBe(2);
    expect(parseActionType("3")).toBe(3);
  });

  it("returns null for null, empty, or out-of-range values", () => {
    expect(parseActionType(null)).toBeNull();
    expect(parseActionType("")).toBeNull();
    expect(parseActionType("0")).toBeNull();
    expect(parseActionType("4")).toBeNull();
    expect(parseActionType("abc")).toBeNull();
  });
});

describe("actionTypeQuery", () => {
  it("formats a query string", () => {
    expect(actionTypeQuery(1)).toBe("?type=1");
    expect(actionTypeQuery(2)).toBe("?type=2");
    expect(actionTypeQuery(3)).toBe("?type=3");
  });
});

describe("parseActionTypeFilter", () => {
  it("accepts single types and the combined view", () => {
    expect(parseActionTypeFilter("2")).toBe(2);
    expect(parseActionTypeFilter("all")).toBe("all");
    expect(parseActionTypeFilter("ALL")).toBeNull();
    expect(parseActionTypeFilter(null)).toBeNull();
  });
});

describe("resolveActionTypes", () => {
  it("expands the combined view to the visible types only", () => {
    expect(resolveActionTypes("all", [1, 3])).toEqual([1, 3]);
    expect(resolveActionTypes(2, [1, 3])).toEqual([2]);
  });
});
