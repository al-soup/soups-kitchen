import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Auth", () => {
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

  test("logout redirects to login", async ({ page }) => {
    await login(page, "admin@local.test", "password123");

    // Open profile dropdown and click logout
    await page.getByRole("button", { name: "Profile menu" }).click();
    await page.getByRole("button", { name: "Log out" }).click();
    await expect(page).toHaveURL("/login");
  });
});
