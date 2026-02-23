import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("homepage loads", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Soup's Kitchen" })
    ).toBeVisible();
  });

  test("sidebar navigation works", async ({ page }) => {
    await page.goto("/");

    // Open sidebar
    await page.getByRole("button", { name: "Toggle menu" }).click();

    // Navigate to Habits
    await page.getByRole("link", { name: "Habit Tracker" }).click();
    await expect(page).toHaveURL("/apps/habits");
    await expect(page.locator("main h1")).toContainText("Habit Tracker");

    // Open sidebar again
    await page.getByRole("button", { name: "Toggle menu" }).click();

    // Navigate to Experience
    await page.getByRole("link", { name: "Experience" }).click();
    await expect(page).toHaveURL("/about/experience");
    await expect(page.locator("main h1")).toContainText("Experience");

    // Open sidebar again
    await page.getByRole("button", { name: "Toggle menu" }).click();

    // Navigate to Me
    await page.getByRole("link", { name: "Me" }).click();
    await expect(page).toHaveURL("/about/me");
    await expect(page.locator("main h1")).toContainText("Me");
  });

  test("sidebar closes when clicking backdrop", async ({ page }) => {
    await page.goto("/");

    // Open sidebar
    await page.getByRole("button", { name: "Toggle menu" }).click();
    await expect(page.locator("aside")).toHaveClass(/open/);

    // Click backdrop to close and wait for transition
    await page.locator("[class*='backdrop']").click({ force: true });
    await expect(page.locator("[class*='backdrop']")).toBeHidden();
  });
});
