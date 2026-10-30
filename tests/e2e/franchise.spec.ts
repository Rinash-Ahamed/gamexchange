import { test, expect } from "@playwright/test";
import { stubImages } from "./helpers";

test("franchise card opens its own page with gallery, map and enquiry", async ({ page }) => {
  await stubImages(page);
  await page.goto("/");
  await page.locator('section[aria-labelledby="services-h"]').getByRole("link", { name: /Franchise enquiry/ }).click();
  await expect(page).toHaveURL("/franchise");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Our next level.");
  await expect(page.locator("#our-spaces figure")).toHaveCount(6);
  await expect(page.getByRole("link", { name: /Open the GamexChange locations map/ })).toHaveAttribute("href", "/franchise/locations-map.webp");
  await expect(page.getByRole("link", { name: "Enquire about a franchise", exact: true })).toHaveAttribute("href", /^https:\/\/wa\.me\/\d+\?text=/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
});
