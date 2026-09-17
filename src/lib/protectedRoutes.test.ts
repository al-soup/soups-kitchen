import { isProtectedPath } from "./protectedRoutes";

describe("isProtectedPath", () => {
  it.each([
    "/tools/resources",
    "/tools/resources/",
    "/apps/habits/create",
    "/apps/habits/42",
  ])("protects %s", (path) => {
    expect(isProtectedPath(path)).toBe(true);
  });

  it.each([
    "/",
    "/login",
    "/profile",
    "/tools",
    "/apps/habits",
    "/apps/habits/manifest.webmanifest",
    "/apps/knowledge-base",
    "/apps/knowledge-base/1",
    "/tools/resourcesx",
  ])("allows %s", (path) => {
    expect(isProtectedPath(path)).toBe(false);
  });
});
