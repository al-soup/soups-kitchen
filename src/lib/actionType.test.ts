import { parseActionType, actionTypeQuery } from "./actionType";

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
