import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("landing shows the directory menu and no top bar", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Alex Kräuchi" })
    ).toBeVisible();
    await expect(page.locator("header")).toHaveCount(0);

    const menu = page.locator("main").getByRole("navigation", { name: "Site" });
    await expect(menu.getByRole("link", { name: "/ habits" })).toBeVisible();
    await expect(menu.getByRole("link", { name: "/ resources" })).toHaveCount(
      0
    );
    // Directory labels are inert; the index pages stay unlinked.
    await expect(menu.getByRole("link", { name: "/apps" })).toHaveCount(0);
  });

  test("drawer navigation works", async ({ page }) => {
    await page.goto("/");
    const drawer = page.locator("#site-drawer");

    await page.getByRole("button", { name: "Toggle menu" }).click();
    await drawer.getByRole("link", { name: "/ habits" }).click();
    await expect(page).toHaveURL("/apps/habits");
    await expect(page.locator("main h1")).toContainText("Habit Tracker");
    await expect(page.locator("header")).toContainText("/apps / habit tracker");

    await page.getByRole("button", { name: "Toggle menu" }).click();
    await drawer.getByRole("link", { name: "/ experience" }).click();
    await expect(page).toHaveURL("/about/experience");
    await expect(page.locator("main h1")).toContainText("Experience");

    await page.getByRole("button", { name: "Toggle menu" }).click();
    await drawer.getByRole("link", { name: "/ me" }).click();
    await expect(page).toHaveURL("/about/me");
    await expect(page.locator("main h1")).toContainText("alex kräuchi");
  });

  test("brand is the way home", async ({ page }) => {
    await page.goto("/about/me");
    await page.getByRole("link", { name: "Home" }).click();
    await expect(page).toHaveURL("/");
  });

  test("drawer closes via backdrop and via the menu button", async ({
    page,
  }) => {
    await page.goto("/");
    const menuButton = page.getByRole("button", { name: "Toggle menu" });
    const backdrop = page.locator("[class*='backdrop']");

    await menuButton.click();
    await expect(backdrop).toBeVisible();
    // The drawer covers the right edge; click the uncovered left side.
    await backdrop.click({ position: { x: 10, y: 300 } });
    await expect(backdrop).toBeHidden();

    await menuButton.click();
    await expect(menuButton).toHaveAttribute("aria-expanded", "true");
    await menuButton.click();
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
  });

  test("index pages stay reachable by URL", async ({ page }) => {
    await page.goto("/about");
    await expect(page.locator("main h1")).toContainText("About");
    await page.goto("/apps");
    await expect(page.locator("main h1")).toContainText("Apps");
  });

  test("old paths redirect", async ({ page }) => {
    await page.goto("/settings");
    await expect(page).toHaveURL("/profile");
  });
});
