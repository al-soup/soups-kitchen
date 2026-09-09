import { safeRedirect } from "./safeRedirect";

describe("safeRedirect", () => {
  it("allows relative in-app paths", () => {
    expect(safeRedirect("/")).toBe("/");
    expect(safeRedirect("/apps/habits")).toBe("/apps/habits");
    expect(safeRedirect("/apps/habits?type=1&x=2")).toBe(
      "/apps/habits?type=1&x=2"
    );
  });

  it("rejects protocol-relative URLs", () => {
    expect(safeRedirect("//evil.com")).toBe("/");
    expect(safeRedirect("//evil.com/path")).toBe("/");
  });

  it("rejects backslash variants", () => {
    expect(safeRedirect("/\\evil.com")).toBe("/");
    expect(safeRedirect("/\\/evil.com")).toBe("/");
  });

  it("rejects absolute URLs", () => {
    expect(safeRedirect("https://evil.com")).toBe("/");
    expect(safeRedirect("http://evil.com")).toBe("/");
    expect(safeRedirect("javascript:alert(1)")).toBe("/");
  });

  it("rejects null, undefined, and empty", () => {
    expect(safeRedirect(null)).toBe("/");
    expect(safeRedirect(undefined)).toBe("/");
    expect(safeRedirect("")).toBe("/");
  });
});
