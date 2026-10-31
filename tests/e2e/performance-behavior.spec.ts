import { test, expect } from "@playwright/test";
import { stubImages } from "./helpers";

test("off-screen decorative loops pause and resume without hiding content", async ({ page }) => {
  await stubImages(page);
  await page.goto("/franchise");
  await page.keyboard.press("Escape");
  const logo = page.locator(".footer-logo-heartbeat");
  await expect(logo).toHaveAttribute("data-motion-visible", "false");
  await expect(logo).toHaveCSS("animation-play-state", /paused/);
  await logo.scrollIntoViewIfNeeded();
  await expect(logo).toHaveAttribute("data-motion-visible", "true");
  await expect(logo).toBeVisible();
  await expect(page.getByRole("heading", { name: "Need Help", exact: true })).toBeVisible();
});

test("public navigation keeps the shared shell and product destination", async ({ page }) => {
  await stubImages(page);
  await page.goto("/franchise");
  await page.keyboard.press("Escape");
  const shop = page.getByRole("navigation", { name: "Primary", exact: true }).filter({ visible: true }).getByRole("link", { name: /Shop/i });
  await shop.focus();
  await shop.click();
  await expect(page).toHaveURL("/products");
  await expect(page.getByRole("searchbox", { name: "Search the shop" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Legal & Policies", exact: true })).toHaveCount(1);
});
