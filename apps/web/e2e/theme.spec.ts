import { test, expect } from "@playwright/test";

test.describe("Theme", () => {
  test("default theme is dark", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("a stored theme that no longer exists falls back to dark", async ({
    page,
  }) => {
    await page.addInitScript(() =>
      localStorage.setItem("soups-kitchen-theme", "neo-brutalist")
    );
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("theme switcher on the profile page changes theme", async ({ page }) => {
    await page.goto("/profile");

    await page.getByRole("button", { name: /^light/i }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

    await page.getByRole("button", { name: /^dark/i }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("theme persists on reload", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("theme-toggle").click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });

  test("toggle next to the menu button flips the theme", async ({ page }) => {
    await page.goto("/about/me");
    const toggle = page.getByTestId("theme-toggle");

    await toggle.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await toggle.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });
});
