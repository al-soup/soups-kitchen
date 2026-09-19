import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Habits", () => {
  test("habits page loads with graph and type selector", async ({ page }) => {
    await page.goto("/apps/habits");
    await expect(page.locator("main h1")).toContainText("Habit Tracker");
    await expect(
      page.getByRole("radiogroup", { name: "Habit type" })
    ).toBeVisible();
  });

  test("admin sees create link", async ({ page }) => {
    await login(page, "admin@local.test", "password123");
    await page.goto("/apps/habits");
    await expect(page.locator("main h1")).toContainText("Habit Tracker");
    await expect(page.getByRole("link", { name: "Create habit" })).toBeVisible({
      timeout: 10000,
    });
  });

  test("viewer does NOT see create link", async ({ page }) => {
    await login(page, "viewer@local.test", "password123");
    await page.goto("/apps/habits");
    await expect(page.locator("main h1")).toContainText("Habit Tracker");
    await expect(
      page.getByRole("link", { name: "Create habit" })
    ).not.toBeVisible();
  });

  test("admin can access create page", async ({ page }) => {
    await login(page, "admin@local.test", "password123");
    await page.goto("/apps/habits/create");
    await expect(page.locator("main h1")).toContainText("Create Habit");
  });

  test("viewer sees not authorized on create page", async ({ page }) => {
    await login(page, "viewer@local.test", "password123");
    await page.goto("/apps/habits/create");
    await expect(page.locator("main h1")).toContainText("Not Authorized");
  });

  test("unauthenticated user redirected from create page", async ({ page }) => {
    await page.goto("/apps/habits/create");
    await expect(page).toHaveURL("/login?redirectTo=%2Fapps%2Fhabits%2Fcreate");
  });
});

test.describe("Habits — combined view, filters, insights", () => {
  test("All shows a type key instead of the ramp and mixes types in the feed", async ({
    page,
  }) => {
    await login(page, "admin@local.test", "password123");
    await page.goto("/apps/habits");
    await page.getByTestId("type-all").click();
    await expect(page).toHaveURL(/type=all/);
    const legend = page.locator("[class*='legendKey']");
    await expect(legend).toHaveCount(3);
    await expect(page.locator("[class*='item']").first()).toBeVisible({
      timeout: 10000,
    });
  });

  test("signed-in viewer sees Bad Habits, anonymous does not", async ({
    page,
  }) => {
    await page.goto("/apps/habits?type=all");
    await expect(page.locator("[class*='legendKey']")).toHaveCount(2);
    await expect(page.getByTestId("type-2")).toHaveCount(0);

    await login(page, "viewer@local.test", "password123");
    await page.goto("/apps/habits?type=all");
    await expect(page.locator("[class*='legendKey']")).toHaveCount(3);
    await expect(page.getByTestId("type-2")).toBeVisible();
  });

  test("action pill filters the feed, sort toggle reverses it", async ({
    page,
  }) => {
    await page.goto("/apps/habits?type=1");
    const [feedResponse, scoresRequest] = await Promise.all([
      page.waitForResponse(
        (r) =>
          decodeURIComponent(r.url()).includes("action_id=eq.") &&
          r.request().method() === "GET"
      ),
      page.waitForRequest(
        (r) =>
          r.url().includes("/rpc/get_daily_habit_scores") &&
          r.postData()?.includes("filter_action_id") === true
      ),
      page
        .getByRole("group", { name: "Filter by action" })
        .getByRole("button", { name: /^L\d Cycling \d+$/ })
        .click(),
    ]);
    expect(decodeURIComponent(feedResponse.url())).toContain("action_id=eq.");
    // The Score Graph follows the action filter too
    expect(scoresRequest.postDataJSON().filter_action_id).toEqual(
      expect.any(Number)
    );
    await expect(page).toHaveURL(/action=\d+/);
    const names = page.locator("[class*='item'] [class*='name']");
    await expect(names.first()).toHaveText("Cycling", { timeout: 10000 });

    await page.getByRole("button", { name: /Sorted newest first/ }).click();
    await expect(page).toHaveURL(/sort=asc/);
    await expect(
      page.getByRole("button", { name: /Sorted oldest first/ })
    ).toBeVisible();
  });

  test("insights page renders tiles and charts per type", async ({ page }) => {
    await login(page, "admin@local.test", "password123");
    await page.goto("/apps/habits/insights?type=all");
    await expect(page.locator("main h1")).toContainText("Insights");
    await expect(page.getByText("Current streak")).toBeVisible();
    await expect(page.getByRole("img", { name: /Weekly score/ })).toBeVisible({
      timeout: 10000,
    });
    await expect(
      page.getByRole("img", { name: /Weekday rhythm/ })
    ).toBeVisible();
    await expect(page.getByText(/Top actions/)).toBeVisible();
    await page.getByTestId("type-3").click();
    await expect(page).toHaveURL(/type=3/);
  });

  test("unauthenticated user redirected from insights", async ({ page }) => {
    await page.goto("/apps/habits/insights");
    await expect(page).toHaveURL(
      "/login?redirectTo=%2Fapps%2Fhabits%2Finsights"
    );
  });
});
