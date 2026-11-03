import { expect, test } from "@playwright/test";
import { serializeJsonLd } from "@/lib/structured-data";
import { collectErrors, stubImages } from "./helpers";

test("JSON-LD escapes HTML without changing the data", () => {
  const data = { name: "Example </script><script>alert(1)</script>" };
  const serialized = serializeJsonLd(data);
  expect(serialized).not.toContain("<");
  expect(JSON.parse(serialized)).toEqual(data);
});

test("structured data survives reload and client product navigation without script warnings", async ({ page }) => {
  await stubImages(page);
  await page.addInitScript(() => sessionStorage.setItem("gx-boot-seen", "1"));
  const errors = collectErrors(page);
  const response = await page.goto("/products");
  expect(await response!.text()).toMatch(/<script[^>]*id="gamexchange-local-business-jsonld"[^>]*type="application\/ld\+json"/);
  const business = page.locator('script#gamexchange-local-business-jsonld[type="application/ld+json"]');
  await expect(business).toHaveCount(1);
  expect(JSON.parse(await business.textContent() ?? "{}")["@context"]).toBe("https://schema.org");
  await expect(page.locator("script#gamexchange-products-jsonld")).toHaveCount(1);
  await page.getByRole("link", { name: /^View .+ details$/ }).first().click();
  await expect(page).toHaveURL(/\/products\/[^/]+$/);
  await expect(page.locator("script#gamexchange-product-jsonld")).toHaveCount(1);
  await expect(page.locator("script#gamexchange-products-jsonld")).toHaveCount(0);
  await expect(business).toHaveCount(1);
  await page.reload();
  await expect(business).toHaveCount(1);
  await expect(page.locator("script#gamexchange-product-jsonld")).toHaveCount(1);
  expect(errors.filter((message) => /Encountered a script tag|hydrat/i.test(message))).toEqual([]);
});
