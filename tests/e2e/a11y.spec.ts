import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { stubImages } from "./helpers";

const ROUTES = ["/", "/products", "/exchange", "/repair-service", "/game-zone", "/contact"];
for (const theme of ["dark", "light"] as const) {
  for (const route of ROUTES) {
    test(`axe: ${route} (${theme})`, async ({ page }) => {
      await stubImages(page);
      await page.addInitScript((t) => {
        localStorage.setItem("gx-theme", t);
        sessionStorage.setItem("gx-boot-seen", "1");
      }, theme);
      await page.goto(route);
      await expect(page.locator('[data-theme-ready="true"]').first()).toBeAttached();
      await expect(page.locator("[data-site-shell]")).not.toHaveAttribute("inert");
      // Inspect settled content, not intermediate opacity/colour in entrance transitions.
      // Infinite decorative loops keep running and their contrast is still checked.
      await page.locator("main").first().evaluate(async (main) => {
        await document.fonts.ready;
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        const finite = main.getAnimations({ subtree: true }).filter((animation) => {
          const timing = animation.effect?.getComputedTiming();
          return timing && Number.isFinite(Number(timing.endTime));
        });
        await Promise.allSettled(finite.map((animation) => animation.finished));
      });
      const res = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
      expect(res.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => ({ target: n.target, detail: n.failureSummary })) }))).toEqual([]);
    });
  }
}
