import { test, expect } from "@playwright/test";
import { stubImages } from "./helpers";

const WIDTHS: Array<[number, number]> = [[320, 640], [360, 740], [390, 844], [430, 932], [600, 960], [768, 1024], [820, 1180], [1024, 768], [1180, 820], [1280, 720], [1440, 900], [1920, 1080]];
const ROUTES = ["/", "/products", "/exchange", "/repair-service", "/game-zone", "/contact"];

test.describe("responsive layout", () => {
  test.skip(({ isMobile }) => isMobile, "viewport sweep runs once, on the desktop project");

  for (const [w, h] of WIDTHS) {
    test(`no horizontal overflow, one primary nav, hero inside viewport @ ${w}px`, async ({ page }) => {
      await stubImages(page);
      await page.setViewportSize({ width: w, height: h });
      for (const route of ROUTES) {
        await page.goto(route);
        await page.waitForTimeout(300);
        const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, vw: document.documentElement.clientWidth }));
        expect(m.sw, `${route} overflows at ${w}px`).toBeLessThanOrEqual(m.vw);
        await expect(page.getByRole("navigation", { name: "Primary" }).filter({ visible: true })).toHaveCount(1);
      }
      await page.goto("/");
      const stage = await page.locator(".hero-stage").boundingBox();
      expect(stage).not.toBeNull();
      // The hero art may bleed into page padding on wide screens, never past the viewport edge by more than the glow.
      expect(stage!.x + stage!.width).toBeLessThanOrEqual(w + 1);
    });
  }
});
