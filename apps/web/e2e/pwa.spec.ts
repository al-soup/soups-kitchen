import { test, expect } from "@playwright/test";

const APPS = ["habits", "fahrplan", "knowledge-base", "fragespiel"];

test.describe("PWA manifests", () => {
  for (const app of APPS) {
    test(`${app} serves its manifest to anon requests`, async ({ request }) => {
      const res = await request.get(`/apps/${app}/manifest.webmanifest`, {
        maxRedirects: 0,
      });
      expect(res.status()).toBe(200);
      expect(res.headers()["content-type"]).toContain(
        "application/manifest+json"
      );
      const manifest = await res.json();
      expect(manifest.start_url).toBe(`/apps/${app}`);
    });
  }
});
