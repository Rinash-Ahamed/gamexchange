import { expect, test } from "@playwright/test";
import { stubImages } from "./helpers";

test("delayed animation frames cannot resurrect the finished intro", async ({ page }) => {
  await stubImages(page);
  await page.addInitScript(() => {
    const realFrame = window.requestAnimationFrame.bind(window);
    const until = performance.now() + 3000;
    window.requestAnimationFrame = (callback) => realFrame((time) => {
      if (performance.now() < until) window.setTimeout(() => callback(time), 2400);
      else callback(time);
    });
  });
  await page.goto("/franchise");
  await expect(page.locator('[data-theme-ready="true"]').first()).toBeAttached();
  // Wait past both the intro deadline and queued, delayed frame callback.
  await page.waitForTimeout(4000);
  await expect(page.locator(".boot-screen")).toHaveCount(0);
  await expect(page.locator("[data-site-shell]")).not.toHaveAttribute("inert");
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
});

test("Escape dismisses the intro without a later reappearance", async ({ page }) => {
  await stubImages(page);
  await page.goto("/franchise");
  await expect(page.locator(".boot-screen")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".boot-screen")).toHaveCount(0);
  await expect(page.locator("[data-site-shell]")).not.toHaveAttribute("inert");
});
