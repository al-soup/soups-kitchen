import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("homepage loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Welcome to Soup's Kitchen" })).toBeVisible();
  });

  test("sidebar navigation works", async ({ page }) => {
    await page.goto("/");

    // Open sidebar
    await page.getByRole("button", { name: "Toggle menu" }).click();

    // Navigate to Habits
    await page.getByRole("link", { name: "Habit Tracker" }).click();
    await expect(page).toHaveURL("/habits");
    await expect(page.locator("main h1")).toContainText("Habit Tracker");

    // Open sidebar again
    await page.getByRole("button", { name: "Toggle menu" }).click();

    // Navigate to Experience
    await page.getByRole("link", { name: "Experience" }).click();
    await expect(page).toHaveURL("/work/experience");
    await expect(page.locator("main h1")).toContainText("Experience");

    // Open sidebar again
    await page.getByRole("button", { name: "Toggle menu" }).click();

    // Navigate to CV
    await page.getByRole("link", { name: "CV" }).click();
    await expect(page).toHaveURL("/work/cv");
    await expect(page.locator("main h1")).toContainText("CV");

    // Open sidebar again
    await page.getByRole("button", { name: "Toggle menu" }).click();

    // Navigate to Settings
    await page.getByRole("link", { name: "Settings" }).click();
    await expect(page).toHaveURL("/settings");
    await expect(page.locator("main h1")).toContainText("Settings");
  });

  test("sidebar closes when clicking backdrop", async ({ page }) => {
    await page.goto("/");

    // Open sidebar
    await page.getByRole("button", { name: "Toggle menu" }).click();
    await expect(page.locator("aside")).toHaveClass(/open/);

    // Click backdrop to close
    await page.locator("[class*='backdrop']").click({ force: true });
    await expect(page.locator("aside")).not.toHaveClass(/open/);
  });
});
