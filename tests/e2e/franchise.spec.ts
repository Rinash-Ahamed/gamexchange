import { test, expect } from "@playwright/test";
import { stubImages } from "./helpers";

test("franchise card opens its own page with gallery, map and enquiry", async ({ page }) => {
  await stubImages(page);
  await page.goto("/");
  await page.locator('section[aria-labelledby="services-h"]').getByRole("link", { name: /Franchise enquiry/ }).click();
  await expect(page).toHaveURL("/franchise");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Our next level.");
  await expect(page.locator("#our-spaces figure")).toHaveCount(6);
  await expect(page.getByRole("link", { name: /Open the GameXchange network illustration/ })).toHaveAttribute("href", "/franchise/presence-network-v2.webp");
  await expect(page.locator(".franchise-gallery-card").first()).toBeVisible();
  await expect(page.locator(".franchise-gallery-image").first()).toHaveCSS("object-fit", "contain");
  await expect(page.getByRole("link", { name: "Enquire about a franchise", exact: true })).toHaveAttribute("href", /^https:\/\/wa\.me\/\d+\?text=/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
});

test("presence artwork can switch to the owner's uncropped location map", async ({ page }) => {
  await stubImages(page);
  await page.goto("/franchise");
  const carousel = page.getByRole("figure", { name: "GameXchange presence images" });
  await carousel.scrollIntoViewIfNeeded();
  const mapButton = carousel.getByRole("button", { name: "Show location map", exact: true });
  await expect(mapButton).toBeEnabled();
  await mapButton.click();
  await expect(mapButton).toHaveAttribute("aria-pressed", "true");
  const map = carousel.getByRole("link", { name: /Open the GameXchange location map/ });
  await expect(map).toHaveAttribute("href", "/franchise/presence-location-map-v2.webp");
  await expect(map.locator("img")).toHaveCSS("object-fit", "contain");
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
});
