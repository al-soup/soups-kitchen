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
    await expect(page.locator("main h1")).toContainText("Alex Kräuchi");
  });

  test("sidebar closes when clicking backdrop", async ({ page }) => {
    await page.goto("/");

    // Open sidebar
    await page.getByRole("button", { name: "Toggle menu" }).click();
    const backdrop = page.locator("[class*='backdrop']");
    await expect(backdrop).toBeVisible();

    // Click backdrop to close
    await backdrop.click();
    await expect(backdrop).toBeHidden();
  });
});
