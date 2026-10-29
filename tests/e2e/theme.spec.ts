import { expect, test } from "@playwright/test";
import { stubImages } from "./helpers";

const theme = (page: import("@playwright/test").Page) => page.locator("html").getAttribute("data-theme");

test.use({ timezoneId: "Asia/Kolkata" });
test.beforeEach(async ({ page }) => { await stubImages(page); });

test.describe("automatic local-time schedule", () => {
  test("daytime uses light theme before hydration", async ({ page }) => {
    await page.clock.setFixedTime("2026-10-15T12:00:00+05:30");
    await page.goto("/", { waitUntil: "commit" });
    await expect.poll(() => theme(page)).toBe("light");
  });

  test("nighttime uses dark theme", async ({ page }) => {
    await page.clock.setFixedTime("2026-10-15T22:00:00+05:30");
    await page.goto("/");
    expect(await theme(page)).toBe("dark");
  });

  test("switches at 6 PM without a refresh", async ({ page }) => {
    await page.clock.install({ time: "2026-10-15T17:59:59.500+05:30" });
    await page.goto("/");
    expect(await theme(page)).toBe("light");
    await page.clock.fastForward(1000);
    await expect.poll(() => theme(page)).toBe("dark");
  });
});

test.describe("manual preference", () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime("2026-10-15T22:00:00+05:30");
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

  test("stored preference beats the time schedule on every page", async ({ page }) => {
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
    await page.clock.setFixedTime("2026-10-15T22:00:00+05:30");
    await page.goto("/");
    await page.getByRole("button", { name: /Switch to/ }).click();
    await expect(page.locator("html")).not.toHaveClass(/theme-anim/);
  });
});

test.describe("interrupted theme transitions", () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime("2026-10-15T22:00:00+05:30");
  });

  test("hidden tabs apply storage changes without starting a transition", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Switch to light theme" })).toBeVisible();
    await page.evaluate(() => {
      Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" });
      Object.defineProperty(document, "startViewTransition", { configurable: true, value: () => {
        throw new Error("A transition must not start in a hidden document");
      } });
      localStorage.setItem("gx-theme", "light");
      window.dispatchEvent(new StorageEvent("storage", { key: "gx-theme", newValue: "light" }));
    });
    await expect.poll(() => theme(page)).toBe("light");
    await expect(page.locator("html")).not.toHaveClass(/theme-anim/);
    expect(errors).toEqual([]);
  });

  test("an aborted transition does not surface an unhandled rejection", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await page.evaluate(() => {
      Object.defineProperty(document, "startViewTransition", { configurable: true, value: (update: () => void) => {
        update();
        const aborted = () => Promise.reject(new DOMException("Transition was aborted because of invalid state. Document hidden", "InvalidStateError"));
        return { ready: aborted(), updateCallbackDone: aborted(), finished: aborted() };
      } });
    });
    await page.getByRole("button", { name: "Switch to light theme" }).click();
    await expect.poll(() => theme(page)).toBe("light");
    await expect(page.locator("html")).not.toHaveClass(/theme-anim/);
    await page.waitForTimeout(50);
    expect(errors).toEqual([]);
  });
});
