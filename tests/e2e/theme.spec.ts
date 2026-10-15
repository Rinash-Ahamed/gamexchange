import { expect, test } from "@playwright/test";
import { stubImages } from "./helpers";

const theme = (page: import("@playwright/test").Page) => page.locator("html").getAttribute("data-theme");

test.beforeEach(async ({ page }) => { await stubImages(page); });

test.describe("first visit follows the system theme", () => {
  test.use({ colorScheme: "light" });
  test("light system → light theme, applied before hydration", async ({ page }) => {
    await page.goto("/", { waitUntil: "commit" });
    await expect.poll(() => theme(page)).toBe("light");
  });
});

test.describe("dark system", () => {
  test.use({ colorScheme: "dark" });
  test("dark system → dark theme", async ({ page }) => {
    await page.goto("/");
    expect(await theme(page)).toBe("dark");
  });

  test("toggle switches instantly, persists across reloads, and keeps scroll position", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.scrollTo({ top: 1200, behavior: "instant" }));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(1200);
    const y = await page.evaluate(() => window.scrollY);

    await page.getByRole("button", { name: "Switch to light theme" }).click();
    expect(await theme(page)).toBe("light");
    expect(await page.evaluate(() => window.scrollY)).toBe(y);
    expect(await page.evaluate(() => localStorage.getItem("gx-theme"))).toBe("light");

    await page.reload();
    expect(await theme(page)).toBe("light");
    await expect(page.getByRole("button", { name: "Switch to dark theme" })).toBeVisible();
  });

  test("stored preference beats the system setting on every page", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("gx-theme", "light"));
    for (const r of ["/", "/products", "/contact"]) {
      await page.goto(r);
      expect(await theme(page)).toBe("light");
    }
  });

  test("colours actually change between themes", async ({ page }) => {
    await page.goto("/");
    const bg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    const dark = await bg();
    await page.getByRole("button", { name: "Switch to light theme" }).click();
    await page.waitForTimeout(450);
    expect(await bg()).not.toBe(dark);
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("theme still switches with no transition class applied", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Switch to/ }).click();
    await expect(page.locator("html")).not.toHaveClass(/theme-anim/);
  });
});
