import { test, expect } from "@playwright/test";
import { stubImages } from "./helpers";

test.beforeEach(async ({ page }) => {
  await stubImages(page);
  // Playwright creates a fresh storage context for each test.
});

test("shop supports a multi-product cart and removal on small and large screens", async ({ page }) => {
  await page.goto("/products");
  const cards = page.locator("article");
  await cards.nth(0).getByRole("button", { name: /Add .+ to cart/ }).click();
  await cards.nth(1).getByRole("button", { name: /Add .+ to cart/ }).click();
  await page.getByRole("link", { name: "Cart, 2 items", exact: true }).click();
  await expect(page).toHaveURL("/cart");
  await expect(page.locator("fieldset article")).toHaveCount(2);
  await expect(page.getByRole("link", { name: "Send cart on WhatsApp" })).toHaveAttribute("href", /wa\.me/);
  await page.getByRole("button", { name: /Remove .+ from cart/ }).first().click();
  await expect(page.locator("fieldset article")).toHaveCount(1);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test("cart storage is bounded and stores no authoritative prices", async ({ page }) => {
  await page.goto("/products");
  await page.locator("article").first().getByRole("button", { name: /Add .+ to cart/ }).click();
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("gx-cart-v1") ?? "[]"));
  expect(stored).toHaveLength(1);
  expect(Object.keys(stored[0]).sort()).toEqual(["id", "quantity"]);
  await page.reload();
  await expect(page.getByRole("link", { name: "Cart, 1 item", exact: true })).toBeVisible();
});
