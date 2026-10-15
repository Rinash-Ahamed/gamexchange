import { test, expect } from "@playwright/test";
import { stubImages } from "./helpers";

const ROUTES = ["/", "/products", "/exchange", "/repair-service", "/game-zone", "/contact"];
const EXTERNAL_HOSTS = ["wa.me", "www.instagram.com", "instagram.com", "maps.google.com", "www.google.com", "goo.gl", "maps.app.goo.gl", "www.facebook.com", "gamexchange.co.in", "docs.google.com", "g.co"];

test("every internal link resolves; external links use allowed hosts", async ({ page, request }) => {
  await stubImages(page);
  const internal = new Set<string>();
  for (const route of ROUTES) {
    await page.goto(route);
    const hrefs = await page.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href") ?? ""));
    for (const h of hrefs) {
      if (h.startsWith("tel:")) expect(h).toMatch(/^tel:\+?\d{10,13}$/);
      else if (h.startsWith("mailto:") || h.startsWith("#")) continue;
      else if (/^https?:/.test(h)) expect(EXTERNAL_HOSTS, `unexpected host in ${h}`).toContain(new URL(h).hostname);
      else internal.add(h.split("#")[0] || "/");
    }
  }
  for (const href of internal) {
    const r = await request.get(href);
    expect(r.status(), href).toBeLessThan(400);
  }
});

test("WhatsApp links are well-formed", async ({ page }) => {
  await stubImages(page);
  await page.goto("/products");
  const links = await page.$$eval('a[href*="wa.me"]', (as) => as.map((a) => a.getAttribute("href") ?? ""));
  expect(links.length).toBeGreaterThan(0);
  for (const l of links) expect(l).toMatch(/^https:\/\/wa\.me\/\d{10,13}(\?text=.*)?$/);
});

test("hero CTAs navigate", async ({ page }) => {
  await stubImages(page);
  await page.goto("/");
  await page.getByRole("link", { name: /Enter game zone/i }).first().click();
  await expect(page).toHaveURL(/\/game-zone/);
  await page.goto("/");
  await page.getByRole("link", { name: /Explore gear/i }).first().click();
  await expect(page).toHaveURL(/\/products/);
});
