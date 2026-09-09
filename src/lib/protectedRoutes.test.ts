import { isProtectedPath } from "./protectedRoutes";

describe("isProtectedPath", () => {
  it.each([
    "/resources",
    "/resources/",
    "/apps/habits/create",
    "/apps/habits/42",
  ])("protects %s", (path) => {
    expect(isProtectedPath(path)).toBe(true);
  });

  it.each([
    "/",
    "/login",
    "/settings",
    "/apps/habits",
    "/apps/knowledge-base",
    "/apps/knowledge-base/1",
    "/resourcesx",
    "/settingsfoo",
  ])("allows %s", (path) => {
    expect(isProtectedPath(path)).toBe(false);
  });
});
