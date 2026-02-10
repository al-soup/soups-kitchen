import { test, expect } from "@playwright/test";

test.describe("Theme", () => {
  test("default theme is light", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    await expect(html).not.toHaveAttribute("data-theme", "dark");
    await expect(html).not.toHaveAttribute("data-theme", "neo-brutalist");
  });

  test("theme switcher in settings changes theme", async ({ page }) => {
    await page.goto("/settings");

    // Click dark theme
    await page.getByRole("button", { name: /dark/i }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    // Click neo-brutalist theme
    await page.getByRole("button", { name: /neo-brutalist/i }).click();
    await expect(page.locator("html")).toHaveAttribute(
      "data-theme",
      "neo-brutalist"
    );

    // Click light theme
    await page.getByRole("button", { name: /light/i }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });

  test("theme persists on reload", async ({ page }) => {
    await page.goto("/settings");

    // Set to dark theme
    await page.getByRole("button", { name: /dark/i }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    // Reload page
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("profile dropdown theme toggle cycles themes", async ({ page }) => {
    await page.goto("/");
    const profileBtn = page.getByRole("button", { name: "Profile menu" });
    const dropdown = page.locator("[class*='dropdown']");
    const themeBtn = dropdown.getByTestId("theme-toggle");

    // Open profile dropdown
    await profileBtn.click();
    await expect(dropdown).toBeVisible();

    // Cycle through themes (dropdown stays open when clicking inside)
    await themeBtn.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    await themeBtn.click();
    await expect(page.locator("html")).toHaveAttribute(
      "data-theme",
      "neo-brutalist"
    );

    await themeBtn.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });
});
