import { test, expect } from "@playwright/test";
import { stubImages } from "./helpers";
import { productConditionSchema, productHref } from "../../src/lib/product-links";

test.beforeEach(async ({ page }) => {
  await stubImages(page);
});

test("compact cards open details while cart actions stay separate", async ({ page }) => {
  await page.goto("/products");
  const card = page.locator("article").first();
  const name = await card.locator("h3").innerText();
  await card.getByRole("button", { name: /Add .+ to cart/ }).click();
  await expect(page).toHaveURL("/products");
  await card.getByRole("link", { name: `View ${name} details`, exact: true }).click();
  await expect(page).toHaveURL(/\/products\/[^/]+$/);
  await expect(page.getByRole("heading", { name, level: 1, exact: true })).toBeVisible();
  await expect(page.locator("main img").first()).toHaveAttribute("loading", "eager");
  const details = page.locator('section[aria-labelledby="product-title"]');
  await expect(details.getByRole("button", { name: /Add another .+ to cart/ })).toContainText("In cart (1)");
  await expect(page).toHaveURL(/\/products\/[^/]+$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
  await details.getByRole("link", { name: "View cart", exact: true }).click();
  await expect(page).toHaveURL("/cart");
});

test("missing products have a helpful unavailable page", async ({ page }) => {
  await page.goto("/products/nonexistent-product-for-test");
  await expect(page.getByRole("heading", { name: "This gear is unavailable." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to the shop" })).toHaveAttribute("href", "/products");
});

test("product links encode IDs and schema conditions never guess", () => {
  expect(productHref("ps5-slim")).toBe("/products/ps5-slim");
  expect(productHref("a/b")).toBe("/products/a%2Fb");
  expect(productConditionSchema("Pre-Owned")).toBe("https://schema.org/UsedCondition");
  expect(productConditionSchema("New")).toBe("https://schema.org/NewCondition");
  expect(productConditionSchema("Unknown")).toBeUndefined();
});
