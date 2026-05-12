import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Knowledge Base", () => {
  test("unauthenticated user redirected to login", async ({ page }) => {
    await page.goto("/apps/knowledge-base");
    await expect(page).toHaveURL("/login?redirectTo=%2Fapps%2Fknowledge-base");
  });

  test("overview lists seed entries", async ({ page }) => {
    await login(page, "admin@local.test", "password123");
    await page.goto("/apps/knowledge-base");
    await expect(page.locator("main h1")).toContainText("Knowledge Base");
    await expect(
      page.getByRole("heading", { name: "Why use a B-tree index?" })
    ).toBeVisible();
  });

  test("search narrows the list by question text", async ({ page }) => {
    await login(page, "admin@local.test", "password123");
    await page.goto("/apps/knowledge-base");

    await page.getByLabel("Search entries").fill("B-tree");

    await expect(
      page.getByRole("heading", { name: "Why use a B-tree index?" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "When is cache-aside the wrong pattern?",
      })
    ).not.toBeVisible();
    await expect(page).toHaveURL(/q=B-tree/);
  });

  test("search tolerates typos via trigram fallback", async ({ page }) => {
    await login(page, "admin@local.test", "password123");
    await page.goto("/apps/knowledge-base");

    await page.getByLabel("Search entries").fill("cacheaside");

    await expect(
      page.getByRole("heading", {
        name: "When is cache-aside the wrong pattern?",
      })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Why use a B-tree index?" })
    ).not.toBeVisible();
  });

  test("topic pill filter narrows results and updates URL", async ({
    page,
  }) => {
    await login(page, "admin@local.test", "password123");
    await page.goto("/apps/knowledge-base");

    await page.getByRole("button", { name: "Algorithms" }).click();

    await expect(page).toHaveURL(/topics=Algorithms/);
    await expect(
      page.getByRole("heading", {
        name: "Hash-map lookup worst case — why O(n)?",
      })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Why use a B-tree index?" })
    ).not.toBeVisible();
  });

  test("clicking a card opens the detail page", async ({ page }) => {
    await login(page, "admin@local.test", "password123");
    await page.goto("/apps/knowledge-base");

    await page.getByRole("link", { name: /Why use a B-tree index\?/ }).click();

    await expect(page).toHaveURL(/\/apps\/knowledge-base\/\d+/);
    await expect(
      page.getByRole("heading", { name: "Why use a B-tree index?" })
    ).toBeVisible();
  });

  test("creates a tag from admin and uses it on a new entry", async ({
    page,
  }) => {
    await login(page, "admin@local.test", "password123");

    const stamp = Date.now();
    const tagName = `e2e topic ${stamp}`;
    const question = `e2e-tag entry ${stamp}?`;

    // Create the topic from the tags admin page.
    await page.goto("/apps/knowledge-base/tags");
    await page.getByLabel("Add a topic").fill(tagName);
    await page.getByLabel("Add a topic").press("Enter");
    await expect(
      page.getByRole("button", { name: `Rename ${tagName}` })
    ).toBeVisible();

    // Create an entry that uses the new tag.
    await page.goto("/apps/knowledge-base/create");
    await page.getByLabel("Question").fill(question);
    await page.getByLabel("Summary").fill("Linked to the new tag.");
    await page.getByRole("button", { name: tagName }).click();
    await page.getByRole("button", { name: "Create entry" }).click();

    // Lands on overview; the entry shows with the new tag in its breadcrumb.
    await expect(page).toHaveURL("/apps/knowledge-base");
    const card = page.getByRole("link", {
      name: new RegExp(question.replace("?", "\\?")),
    });
    await expect(card).toBeVisible();
    await expect(card).toContainText(tagName, { ignoreCase: true });
  });

  test("full CRUD on a knowledge entry", async ({ page }) => {
    await login(page, "admin@local.test", "password123");

    const stamp = Date.now();
    const initialQuestion = `e2e crud ${stamp}?`;
    const updatedQuestion = `e2e crud ${stamp} (edited)?`;

    // CREATE
    await page.goto("/apps/knowledge-base/create");
    await page.getByLabel("Question").fill(initialQuestion);
    await page.getByLabel("Summary").fill("Initial summary.");
    await page.getByRole("button", { name: "Create entry" }).click();
    await expect(page).toHaveURL("/apps/knowledge-base");
    await expect(
      page.getByRole("heading", { name: initialQuestion })
    ).toBeVisible();

    // READ
    await page.getByRole("heading", { name: initialQuestion }).click();
    await expect(page).toHaveURL(/\/apps\/knowledge-base\/\d+/);
    await expect(
      page.getByRole("heading", { name: initialQuestion })
    ).toBeVisible();

    // UPDATE
    await page.getByRole("button", { name: "Switch to edit mode" }).click();
    await page.getByLabel("Question").fill(updatedQuestion);
    await page.getByRole("button", { name: "Save" }).click();
    await page.getByRole("button", { name: "Switch to preview mode" }).click();
    await expect(
      page.getByRole("heading", { name: updatedQuestion })
    ).toBeVisible();

    // DELETE
    await page.getByRole("button", { name: "Switch to edit mode" }).click();
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Delete" }).click();
    await expect(page).toHaveURL("/apps/knowledge-base");
    await expect(
      page.getByRole("heading", { name: updatedQuestion })
    ).not.toBeVisible();
  });
});
