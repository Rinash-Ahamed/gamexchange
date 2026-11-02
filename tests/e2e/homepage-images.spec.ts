import { test, expect } from "@playwright/test";
import { homepageImageSlots } from "../../src/data/homepage-images";
import { stubImages } from "./helpers";

test("homepage image slots cover existing services and stations with stable unique IDs", () => {
  expect(homepageImageSlots.filter((slot) => slot.group === "services")).toHaveLength(6);
  expect(homepageImageSlots.filter((slot) => slot.group === "gamezone")).toHaveLength(3);
  expect(new Set(homepageImageSlots.map((slot) => slot.id)).size).toBe(9);
  for (const slot of homepageImageSlots) {
    expect(slot.id).toMatch(/^[a-z0-9-]+$/);
    expect(slot.image).toMatch(/^\//);
  }
});

test("homepage image editors require admin authentication", async ({ page }) => {
  for (const route of ["/admin/homepage-services", "/admin/homepage-gamezone"]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/admin\/login/);
  }
});

test("Joy-Con interaction no longer adds a coloured screen light", async ({ page }) => {
  await stubImages(page);
  await page.goto("/");
  await page.keyboard.press("Escape");
  const previous = page.getByRole("button", { name: "Previous promotion" });
  await previous.scrollIntoViewIfNeeded();
  await previous.focus();
  const content = await page.locator(".promo-switch-screen").evaluate((element) => getComputedStyle(element, "::after").content);
  expect(["none", "normal"]).toContain(content);
});
