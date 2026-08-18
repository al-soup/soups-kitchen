import { test, expect, devices } from "@playwright/test";
import { login } from "./helpers";

const OLDEST_SEED_ENTRY = "Two-phase commit — when is it worth the cost?";

test.describe("Knowledge Base", () => {
  test("anon can browse list and detail; no manager UI is shown", async ({
    page,
  }) => {
    // List is public.
    await page.goto("/apps/knowledge-base");
    await expect(page).toHaveURL("/apps/knowledge-base");
    await expect(
      page.getByRole("heading", { name: "Why use a B-tree index?" })
    ).toBeVisible();

    // No manager-only toolbar buttons.
    await expect(page.getByRole("link", { name: "+ New entry" })).toHaveCount(
      0
    );
    await expect(
      page.getByRole("link", { name: "Tags", exact: true })
    ).toHaveCount(0);

    // Detail page is public.
    await page.getByRole("link", { name: /Why use a B-tree index\?/ }).click();
    await expect(page).toHaveURL(/\/apps\/knowledge-base\/\d+/);
    await expect(
      page.getByRole("heading", { name: "Why use a B-tree index?" })
    ).toBeVisible();

    // No Edit FAB / actions visible to anon.
    await expect(
      page.getByRole("button", { name: "Switch to edit mode" })
    ).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Save" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Delete" })).toHaveCount(0);
  });

  test("anon hitting /resources is redirected to login", async ({ page }) => {
    await page.goto("/resources");
    await expect(page).toHaveURL("/login?redirectTo=%2Fresources");
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

  test("sorting by oldest reorders the list and updates the URL", async ({
    page,
  }) => {
    await page.goto("/apps/knowledge-base");

    // Default (newest first) does not put the oldest seed entry on top.
    const firstHeading = page.getByTestId("kb-card").first().locator("h2");
    await expect(firstHeading).not.toHaveText(OLDEST_SEED_ENTRY);

    await page.getByRole("button", { name: "Oldest" }).click();

    await expect(page).toHaveURL(/sort=oldest/);
    await expect(firstHeading).toHaveText(OLDEST_SEED_ENTRY);

    // Back to the default drops the param again.
    await page.getByRole("button", { name: "Newest" }).click();
    await expect(page).toHaveURL("/apps/knowledge-base");
  });

  test("sorting by topic renders group headers", async ({ page }) => {
    await page.goto("/apps/knowledge-base");

    // No grouping in the default sort.
    await expect(page.getByTestId("kb-group-header")).toHaveCount(0);

    await page.getByRole("button", { name: "By topic" }).click();

    await expect(page).toHaveURL(/sort=topic/);
    // Groups are ordered by topic name, so Algorithms leads.
    const firstGroup = page.getByTestId("kb-group-header").first();
    await expect(firstGroup).toContainText("Algorithms");
    await expect(firstGroup).toContainText(/\d+/);
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

    // Lands on the new entry's detail page; tag breadcrumb is visible.
    await expect(page).toHaveURL(/\/apps\/knowledge-base\/\d+/);
    await expect(page.getByRole("heading", { name: question })).toBeVisible();
    await expect(page.getByLabel("Tags")).toContainText(tagName, {
      ignoreCase: true,
    });

    // The overview now lists the new entry with the tag in its breadcrumb.
    await page.goto("/apps/knowledge-base");
    const card = page.getByTestId("kb-card").filter({
      has: page.getByRole("heading", { name: question }),
    });
    await expect(card).toBeVisible();
    await expect(card).toContainText(tagName, { ignoreCase: true });
  });

  test("full CRUD on a knowledge entry", async ({ page }) => {
    await login(page, "admin@local.test", "password123");

    const stamp = Date.now();
    const initialQuestion = `e2e crud ${stamp}?`;
    const updatedQuestion = `e2e crud ${stamp} (edited)?`;

    // CREATE — lands directly on the new entry's detail page.
    await page.goto("/apps/knowledge-base/create");
    await page.getByLabel("Question").fill(initialQuestion);
    await page.getByLabel("Summary").fill("Initial summary.");
    await page.getByRole("button", { name: "Create entry" }).click();
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

// Touch devices can't hover, so the summary is toggled by tapping the card and
// only "Read" navigates. Needs a mobile device descriptor: the behaviour is
// gated on the (hover: none) media query.
test.describe("Knowledge Base on touch devices", () => {
  test.use({ ...devices["Pixel 5"] });

  // The tap toggle spans the whole card, but the revealed summary sits above it
  // so it can scroll — which puts the summary under the toggle's centre point
  // once expanded. Pin taps to the breadcrumb row (card padding-top is 18px),
  // where the toggle is the hit target whether the card is open or closed.
  const TAP_CARD_TOP = { position: { x: 40, y: 24 } };

  test("tapping a card toggles its summary instead of navigating", async ({
    page,
  }) => {
    await page.goto("/apps/knowledge-base");

    const card = page.getByTestId("kb-card").first();
    const toggle = card.getByTestId("kb-card-toggle");
    // The summary is clipped by its wrapper rather than hidden, so assert on
    // the wrapper's height — a clipped child still has a bounding box.
    const reveal = card.getByTestId("kb-card-reveal");

    await expect(toggle).toBeVisible();
    await expect(reveal).toHaveCSS("max-height", "0px");

    await toggle.tap(TAP_CARD_TOP);
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(reveal).not.toHaveCSS("max-height", "0px");
    await expect(card.getByTestId("kb-card-summary")).toBeVisible();
    await expect(page).toHaveURL("/apps/knowledge-base");

    await toggle.tap(TAP_CARD_TOP);
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(reveal).toHaveCSS("max-height", "0px");
    await expect(page).toHaveURL("/apps/knowledge-base");
  });

  test("tapping the summary scrolls it rather than collapsing the card", async ({
    page,
  }) => {
    await page.goto("/apps/knowledge-base");

    const card = page.getByTestId("kb-card").first();
    const toggle = card.getByTestId("kb-card-toggle");

    await toggle.tap(TAP_CARD_TOP);
    await expect(toggle).toHaveAttribute("aria-expanded", "true");

    // The summary sits above the toggle so it stays scrollable and selectable;
    // tapping it must neither collapse the card nor navigate.
    await card.getByTestId("kb-card-summary").tap();

    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(page).toHaveURL("/apps/knowledge-base");
  });

  test("the Read link still opens the detail page", async ({ page }) => {
    await page.goto("/apps/knowledge-base");

    await page
      .getByTestId("kb-card")
      .first()
      .getByRole("link", { name: /^Read/ })
      .tap();

    await expect(page).toHaveURL(/\/apps\/knowledge-base\/\d+/);
  });
});
