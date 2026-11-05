import { expect, test } from "@playwright/test";
import { hasImageVersion } from "../../src/lib/image-request";

test("image metadata requires a bounded version before any database access", () => {
  expect(hasImageVersion(new URL("https://example.com/image"))).toBe(false);
  expect(hasImageVersion(new URL("https://example.com/image?v="))).toBe(false);
  expect(hasImageVersion(new URL(`https://example.com/image?v=${"a".repeat(129)}`))).toBe(false);
  expect(hasImageVersion(new URL("https://example.com/image?v=legacy-opaque-version"))).toBe(true);
});
test("unversioned image requests fail safely without configured Firebase", async ({ request }) => {
  for (const path of ["/api/inventory/fixture/image", "/api/banners/fixture/image", "/api/franchise/fixture/image", "/api/homepage-images/zone-ps5"]) {
    const response = await request.get(path);
    expect(response.status()).toBe(404);
    expect(response.headers()["cache-control"]).toContain("no-store");
  }
});
test("anonymous admin dashboard redirects without exposing private dashboard records", async ({ request, page }) => {
  const response = await request.get("/admin", { maxRedirects: 0 });
  // Next can stream a redirect in a 200 document after the parent shell has started.
  const html = await response.text();
  expect(html).not.toContain("Operations dashboard");
  expect(html).not.toContain("Recent service records");
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.getByRole("heading", { name: "Operations dashboard" })).toHaveCount(0);
});
