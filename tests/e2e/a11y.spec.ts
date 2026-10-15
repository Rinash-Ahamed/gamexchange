import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { stubImages } from "./helpers";

const ROUTES = ["/", "/products", "/exchange", "/repair-service", "/game-zone", "/contact"];
for (const theme of ["dark", "light"] as const) {
  for (const route of ROUTES) {
    test(`axe: ${route} (${theme})`, async ({ page }) => {
      await stubImages(page);
      await page.addInitScript((t) => localStorage.setItem("gx-theme", t), theme);
      await page.goto(route);
      await page.waitForTimeout(1200);
      const res = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
      expect(res.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`)).toEqual([]);
    });
  }
}
