import { test, expect } from "@playwright/test";
import { login } from "./helpers";

const ADMIN = { email: "admin@local.test", password: "password123" };
const MANAGER = { email: "manager@local.test", password: "password123" };
const VIEWER = { email: "viewer@local.test", password: "password123" };

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54221";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

test.describe("Habits — Create page", () => {
  test.describe("Auth & Access", () => {
    test("unauthenticated → redirects to login with redirectTo", async ({
      page,
    }) => {
      await page.goto("/apps/habits/create");
      await expect(page).toHaveURL(
        "/login?redirectTo=%2Fapps%2Fhabits%2Fcreate"
      );
    });

    test("after login, redirected back to create page", async ({ page }) => {
      await page.goto("/apps/habits/create");
      await expect(page).toHaveURL(
        "/login?redirectTo=%2Fapps%2Fhabits%2Fcreate"
      );
      await page.locator("#email").fill(MANAGER.email);
      await page.locator("#password").fill(MANAGER.password);
      await page.getByRole("button", { name: "Log in" }).click();
      await expect(page).toHaveURL("/apps/habits/create");
    });

    test("viewer sees Not Authorized, no form", async ({ page }) => {
      await login(page, VIEWER.email, VIEWER.password);
      await page.goto("/apps/habits/create");
      await expect(page.locator("main h1")).toContainText("Not Authorized");
      await expect(page.getByTestId("submit-btn")).not.toBeVisible();
    });
  });

  test.describe("Page Load", () => {
    test.beforeEach(async ({ page }) => {
      await login(page, ADMIN.email, ADMIN.password);
      await page.goto("/apps/habits/create");
      await expect(
        page.getByRole("checkbox").first()
      ).toBeVisible();
    });

    test("level badges visible", async ({ page }) => {
      const badges = page.locator("[class*='levelBadge']");
      await expect(badges.first()).toBeVisible();
      const count = await badges.count();
      for (let i = 0; i < count; i++) {
        await expect(badges.nth(i)).toHaveText(/^L\d$/);
      }
    });

    test("submit button disabled on load", async ({ page }) => {
      await expect(page.getByTestId("submit-btn")).toBeDisabled();
    });

    test("back arrow navigates to /apps/habits", async ({ page }) => {
      await page.getByRole("link", { name: "Back to habits" }).click();
      await expect(page).toHaveURL("/apps/habits");
    });
  });

  test.describe("Tab Switching", () => {
    test.beforeEach(async ({ page }) => {
      await login(page, ADMIN.email, ADMIN.password);
      await page.goto("/apps/habits/create");
      await expect(page.getByRole("checkbox").first()).toBeVisible();
    });

    test("switching to Type 2 shows only Sweets, Smoking, Party", async ({
      page,
    }) => {
      await page.getByRole("radio", { name: "Type 2" }).click();
      await expect(
        page.getByRole("checkbox", { name: "Sweets" })
      ).toBeVisible();
      await expect(
        page.getByRole("checkbox", { name: "Smoking" })
      ).toBeVisible();
      await expect(page.getByRole("checkbox", { name: "Party" })).toBeVisible();
      await expect(page.getByRole("checkbox")).toHaveCount(3);
    });

    test("switching tabs clears selection", async ({ page }) => {
      await page.getByRole("checkbox", { name: "Daily Stretches" }).check();
      await expect(page.getByTestId("submit-btn")).toBeEnabled();
      await page.getByRole("radio", { name: "Type 2" }).click();
      await expect(page.getByTestId("submit-btn")).toBeDisabled();
    });
  });

  test.describe("Row Interaction", () => {
    test.beforeEach(async ({ page }) => {
      await login(page, ADMIN.email, ADMIN.password);
      await page.goto("/apps/habits/create");
      await page.getByRole("radio", { name: "Type 2" }).click();
      await expect(
        page.getByRole("checkbox", { name: "Sweets" })
      ).toBeVisible();
    });

    test("clicking row → checkbox checked + date input visible", async ({
      page,
    }) => {
      await page.getByTestId("action-row-12").getByText("Sweets").click();
      await expect(
        page.getByRole("checkbox", { name: "Sweets" })
      ).toBeChecked();
      await expect(page.locator('input[type="date"]')).toBeVisible();
    });

    test("clicking checkbox only → checked, no date input", async ({
      page,
    }) => {
      await page.getByRole("checkbox", { name: "Sweets" }).check();
      await expect(
        page.getByRole("checkbox", { name: "Sweets" })
      ).toBeChecked();
      await expect(page.locator('input[type="date"]')).not.toBeVisible();
    });

    test("unchecking row → date input hidden", async ({ page }) => {
      await page.getByTestId("action-row-12").getByText("Sweets").click();
      await expect(page.locator('input[type="date"]')).toBeVisible();
      await page.getByRole("checkbox", { name: "Sweets" }).uncheck();
      await expect(page.locator('input[type="date"]')).not.toBeVisible();
    });

    test("clicking expanded selected row → collapses", async ({ page }) => {
      await page.getByTestId("action-row-12").getByText("Sweets").click();
      await expect(page.locator('input[type="date"]')).toBeVisible();
      await page.getByTestId("action-row-12").getByText("Sweets").click();
      await expect(page.locator('input[type="date"]')).not.toBeVisible();
    });

    test("clicking collapsed selected row → expands again", async ({
      page,
    }) => {
      const row = page.getByTestId("action-row-12").getByText("Sweets");
      await row.click(); // select + expand
      await row.click(); // collapse
      await expect(page.locator('input[type="date"]')).not.toBeVisible();
      await row.click(); // expand
      await expect(page.locator('input[type="date"]')).toBeVisible();
    });
  });

  test.describe("Expanded Detail Fields", () => {
    test.beforeEach(async ({ page }) => {
      // 5-step setup (login + 2 navigations + 2 clicks) — needs extra headroom.
      test.setTimeout(25000);
      await login(page, ADMIN.email, ADMIN.password);
      await page.goto("/apps/habits/create");
      await page.getByRole("radio", { name: "Type 2" }).click();
      await page.getByTestId("action-row-12").getByText("Sweets").click();
      await expect(page.locator('input[type="date"]')).toBeVisible();
    });

    test("date defaults to today, time to current HH:MM", async ({ page }) => {
      const today = await page.evaluate(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      });
      const currentTime = await page.evaluate(() => {
        const d = new Date();
        return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      });
      await expect(page.locator('input[type="date"]')).toHaveValue(today);
      await expect(page.locator('input[type="time"]')).toHaveValue(currentTime);
    });

    test("changing date to past → time resets to 10:10", async ({ page }) => {
      await page.locator('input[type="date"]').fill("2024-01-15");
      await expect(page.locator('input[type="time"]')).toHaveValue("10:10");
    });

    test("changing date back to today → time = current HH:MM", async ({
      page,
    }) => {
      const today = await page.evaluate(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      });
      const currentTime = await page.evaluate(() => {
        const d = new Date();
        return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      });
      await page.locator('input[type="date"]').fill("2024-01-15");
      await page.locator('input[type="date"]').fill(today);
      await expect(page.locator('input[type="time"]')).toHaveValue(currentTime);
    });

    test("editing note persists while row selected", async ({ page }) => {
      await page.locator("textarea").fill("my test note");
      await expect(page.locator("textarea")).toHaveValue("my test note");
    });
  });

  test.describe("Multi-Select & Submit", () => {
    test.beforeEach(async ({ page }) => {
      await login(page, ADMIN.email, ADMIN.password);
      await page.goto("/apps/habits/create");
      await page.getByRole("radio", { name: "Type 2" }).click();
      await expect(
        page.getByRole("checkbox", { name: "Sweets" })
      ).toBeVisible();
    });

    test("select 2 rows → submit btn reads Save 2 habits", async ({
      page,
    }) => {
      await page.getByRole("checkbox", { name: "Sweets" }).check();
      await page.getByRole("checkbox", { name: "Smoking" }).check();
      await expect(
        page.getByRole("button", { name: "Save 2 habits" })
      ).toBeVisible();
    });

    test("submit → navigate to detail → verify action + note", async ({
      page,
    }) => {
      // Two navigations + DB insert — needs more headroom than the default.
      test.setTimeout(20000);

      const uniqueNote = `e2e-test-${Date.now()}`;

      await page.getByTestId("action-row-12").getByText("Sweets").click();
      await page.locator("textarea").fill(uniqueNote);

      const respPromise = page.waitForResponse(
        (r) =>
          r.url().includes("/rest/v1/habit") &&
          r.request().method() === "POST"
      );
      await page.getByTestId("submit-btn").click();
      const resp = await respPromise;
      const [created] = await resp.json();

      await page.goto(`/apps/habits/${created.id}`);
      await expect(page.getByTestId("action-name")).toContainText("Sweets");
      await expect(page.getByTestId("habit-note")).toContainText(uniqueNote);
    });

    test("after submit: selection cleared + success banner", async ({
      page,
    }) => {
      await page.getByRole("checkbox", { name: "Sweets" }).check();

      const respPromise = page.waitForResponse(
        (r) =>
          r.url().includes("/rest/v1/habit") &&
          r.request().method() === "POST"
      );
      await page.getByTestId("submit-btn").click();
      await respPromise;

      await expect(page.getByTestId("success-message")).toBeVisible();
      await expect(
        page.getByRole("checkbox", { name: "Sweets" })
      ).not.toBeChecked();
    });
  });

  /**
   * Error Handling
   *
   * canCreate requires 'admin' or 'manager' role, which are the same roles
   * that have DB-level INSERT permission. Viewer can never reach the form, so
   * the UI error path cannot be exercised with a real user.
   *
   * Instead we verify the security constraint end-to-end: viewer's real auth
   * token is rejected by the RLS policy when calling the Supabase REST API
   * directly.
   */
  test.describe("Error Handling", () => {
    test("viewer INSERT blocked by RLS", async ({ page }) => {
      await login(page, VIEWER.email, VIEWER.password);

      // Viewer sees "Not Authorized" — the form is never rendered.
      await page.goto("/apps/habits/create");
      await expect(page.locator("main h1")).toContainText("Not Authorized");

      // Extract viewer's JWT from the browser session.
      // @supabase/ssr stores the session as a base64-encoded cookie named
      // "sb-<project-ref>-auth-token" (may be chunked: .0, .1, …).
      const cookies = await page.context().cookies();
      const authChunks = cookies
        .filter((c) => /^sb-.+-auth-token/.test(c.name))
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((c) => c.value);

      const raw = authChunks.join("");
      const json = Buffer.from(
        raw.replace(/^base64-/, ""),
        "base64"
      ).toString("utf-8");
      const accessToken: string | null = JSON.parse(json)?.access_token ?? null;

      expect(accessToken).toBeTruthy();

      const response = await page.request.post(
        `${SUPABASE_URL}/rest/v1/habit`,
        {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          data: [
            {
              action_id: 1,
              completed_at: new Date().toISOString(),
            },
          ],
        }
      );

      expect(response.status()).toBe(403);
      const body = await response.json();
      expect(body.message).toContain("row-level security");
    });
  });
});
