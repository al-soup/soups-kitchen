import { test, expect } from "@playwright/test";

test.describe("Fahrplan", () => {
  test("page loads with search input", async ({ page }) => {
    await page.goto("/apps/fahrplan");
    await expect(page.getByPlaceholder("Search station...")).toBeVisible();
    await expect(page.getByText("Find your station")).toBeVisible();
  });

  test("search shows dropdown and selects station", async ({ page }) => {
    await page.goto("/apps/fahrplan");
    const input = page.getByPlaceholder("Search station...");
    await input.fill("Zurich");

    // Wait for dropdown to appear
    await expect(page.locator("[role='listbox']")).toBeVisible({
      timeout: 5000,
    });

    // Click first result
    const firstOption = page.locator("[role='option']").first();
    const stationName = await firstOption.textContent();
    await firstOption.click();

    // Departure board should render
    await expect(page.getByText(stationName!.trim())).toBeVisible();
    await expect(page.getByText("Change")).toBeVisible();
  });

  test("Change button returns to search", async ({ page }) => {
    await page.goto("/apps/fahrplan");
    const input = page.getByPlaceholder("Search station...");
    await input.fill("Bern");

    await expect(page.locator("[role='listbox']")).toBeVisible({
      timeout: 5000,
    });
    await page.locator("[role='option']").first().click();

    await expect(page.getByText("Change")).toBeVisible();
    await page.getByText("Change").click();

    await expect(page.getByPlaceholder("Search station...")).toBeVisible();
  });

  test("sidebar has Fahrplan link", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Toggle menu" }).click();
    const link = page.getByRole("link", { name: "Fahrplan" });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL("/apps/fahrplan");
  });
});
