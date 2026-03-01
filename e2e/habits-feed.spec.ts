import { test, expect } from "@playwright/test";
import { login } from "./helpers";

const VIEWER = { email: "viewer@local.test", password: "password123" };

test.describe("Habits — Feed", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, VIEWER.email, VIEWER.password);
    await page.goto("/apps/habits");
  });

  test("feed renders below graph with items", async ({ page }) => {
    // Wait for at least one feed item to appear
    const feedItem = page.locator("[class*='item']").first();
    await expect(feedItem).toBeVisible({ timeout: 10000 });
  });

  test("date group headers render in uppercase abbreviated format", async ({
    page,
  }) => {
    const header = page.locator("[class*='dateHeader']").first();
    await expect(header).toBeVisible({ timeout: 10000 });
    // e.g. "28 Feb 2026"
    await expect(header).toHaveText(/^\d{1,2} \w{3} \d{4}$/);
  });

  test("level badges show L{n} format", async ({ page }) => {
    const badges = page.locator("[class*='levelBadge']");
    await expect(badges.first()).toBeVisible({ timeout: 10000 });
    const count = await badges.count();
    for (let i = 0; i < Math.min(count, 5); i++) {
      await expect(badges.nth(i)).toHaveText(/^L\d$/);
    }
  });

  test("switching to Type 2 resets feed", async ({ page }) => {
    await expect(page.locator("[class*='item']").first()).toBeVisible({
      timeout: 10000,
    });

    // Capture response concurrently with click so we don't miss it
    const [response] = await Promise.all([
      page.waitForResponse(
        (r) =>
          r.url().includes("/rest/v1/habit") && r.request().method() === "GET"
      ),
      page.getByRole("radio", { name: "Type 2" }).click(),
    ]);

    // DB-agnostic: verify the refetch applied the type-2 filter
    expect(decodeURIComponent(response.url())).toContain("action.type=eq.2");

    // Feed settled (items or empty state visible)
    await expect(
      page.locator("[class*='item'], [class*='emptyState']").first()
    ).toBeVisible({ timeout: 10000 });
  });

  test("Type 2 has fewer than 20 entries — no Load more button", async ({
    page,
  }) => {
    await page.getByRole("radio", { name: "Type 2" }).click();
    await expect(page.locator("[class*='item']").first()).toBeVisible({
      timeout: 10000,
    });
    await expect(
      page.getByRole("button", { name: "Load more" })
    ).not.toBeVisible();
  });

  test("Type 1 has 20+ entries — Load more visible and loads additional items", async ({
    page,
  }) => {
    // Type 1 is selected by default
    const loadMore = page.getByRole("button", { name: "Load more" });
    await expect(loadMore).toBeVisible({ timeout: 10000 });

    const countBefore = await page.locator("[class*='item']").count();
    await loadMore.click();

    // Button may disappear if second page exhausts results — poll item count directly
    await expect(async () => {
      const countAfter = await page.locator("[class*='item']").count();
      expect(countAfter).toBeGreaterThan(countBefore);
    }).toPass({ timeout: 10000 });
  });

  test("feed items contain action name", async ({ page }) => {
    await expect(page.locator("[class*='item']").first()).toBeVisible({
      timeout: 10000,
    });

    await expect(
      page.locator("[class*='item']").first().locator("[class*='name']")
    ).not.toBeEmpty();
  });
});
