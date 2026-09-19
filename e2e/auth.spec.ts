import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Auth", () => {
  test("anon visiting protected page is redirected server-side", async ({
    page,
  }) => {
    const res = await page.goto("/tools/resources");
    expect(res?.request().redirectedFrom()?.url()).toContain(
      "/tools/resources"
    );
    await expect(page).toHaveURL("/login?redirectTo=%2Ftools%2Fresources");
  });

  test("login with valid credentials", async ({ page }) => {
    await login(page, "admin@local.test", "password123");
    await expect(page).toHaveURL("/");
  });

  test("login with invalid credentials shows error", async ({ page }) => {
    await page.goto("/login");
    await page.locator("#email").fill("admin@local.test");
    await page.locator("#password").fill("wrongpassword");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page.locator("p[class*='error']")).toContainText(
      "Invalid email or password"
    );
  });

  test("old /resources path still ends at the login gate", async ({ page }) => {
    await page.goto("/resources");
    await expect(page).toHaveURL("/login?redirectTo=%2Ftools%2Fresources");
  });

  test("drawer offers login to anon and the profile when signed in", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Toggle menu" }).click();
    const drawer = page.locator("#site-drawer");
    await expect(drawer.getByRole("link", { name: "login" })).toBeVisible();
    await expect(drawer.getByRole("link", { name: "/ resources" })).toHaveCount(
      0
    );

    await login(page, "admin@local.test", "password123");
    await page.getByRole("button", { name: "Toggle menu" }).click();
    await expect(
      drawer.getByRole("link", { name: "/ resources" })
    ).toBeVisible();
    await drawer.getByRole("link", { name: "admin@local.test" }).click();
    await expect(page).toHaveURL("/profile");
  });

  test("logout from the profile page redirects to login", async ({ page }) => {
    await login(page, "admin@local.test", "password123");
    await page.goto("/profile");
    await page.getByRole("button", { name: "Log out" }).click();
    await expect(page).toHaveURL("/login");
  });
});
