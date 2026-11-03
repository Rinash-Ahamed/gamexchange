import { expect, test } from "@playwright/test";
import { stubImages } from "./helpers";

const theme = (page: import("@playwright/test").Page) => page.locator("html").getAttribute("data-theme");

test.use({ timezoneId: "Asia/Kolkata" });
test.beforeEach(async ({ page }) => {
  await stubImages(page);
  await page.addInitScript(() => sessionStorage.setItem("gx-boot-seen", "1"));
  await page.bringToFront();
});

async function ready(page: import("@playwright/test").Page) {
  await expect(page.locator('[data-theme-ready="true"]').first()).toBeAttached();
}

async function initialTheme(page: import("@playwright/test").Page) {
  await page.waitForFunction(() => Reflect.get(window, Symbol.for("gamexchange.theme.initialized")) === true);
}

test.describe("automatic local-time schedule", () => {
  test("initial client bootstrap uses light during daytime", async ({ page }) => {
    await page.clock.setFixedTime("2026-10-15T12:00:00+05:30");
    await page.goto("/", { waitUntil: "commit" });
    await initialTheme(page);
    await expect.poll(() => theme(page)).toBe("light");
  });

  test("nighttime uses dark theme", async ({ page }) => {
    await page.clock.setFixedTime("2026-10-15T22:00:00+05:30");
    await page.goto("/");
    await initialTheme(page);
    expect(await theme(page)).toBe("dark");
  });

  test("switches at 6 PM without a refresh", async ({ page }) => {
    await page.clock.install({ time: "2026-10-15T17:58:00+05:30" });
    // Exercise the shared shell without advancing the homepage's unrelated animation timers.
    await page.goto("/policies");
    await ready(page);
    expect(await theme(page)).toBe("light");
    await page.clock.fastForward(125000);
    await expect.poll(() => theme(page)).toBe("dark");
  });

  test("a preference chosen after scheduling survives the boundary", async ({ page }) => {
    await page.clock.install({ time: "2026-10-15T17:58:00+05:30" });
    await page.goto("/policies");
    await ready(page);
    await expect.poll(() => theme(page)).toBe("light");
    await page.getByRole("button", { name: "Switch to dark theme", exact: true }).click();
    await expect.poll(() => theme(page)).toBe("dark");
    await page.getByRole("button", { name: "Switch to light theme", exact: true }).click();
    await expect.poll(() => theme(page)).toBe("light");
    await page.clock.fastForward(125000);
    expect(await page.evaluate(() => localStorage.getItem("gx-theme"))).toBe("light");
    await expect.poll(() => theme(page)).toBe("light");
  });
});

test.describe("manual preference", () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime("2026-10-15T22:00:00+05:30");
  });

  test("toggle switches instantly, persists across reloads, and keeps scroll position", async ({ page }) => {
    await page.goto("/");
    await ready(page);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollHeight - innerHeight)).toBeGreaterThan(1200);
    await page.evaluate(() => window.scrollTo({ top: 1200, behavior: "instant" }));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(1200);
    const y = await page.evaluate(() => window.scrollY);

    await page.getByRole("button", { name: "Switch to light theme" }).click();
    expect(await theme(page)).toBe("light");
    expect(await page.evaluate(() => window.scrollY)).toBe(y);
    expect(await page.evaluate(() => localStorage.getItem("gx-theme"))).toBe("light");

    await page.reload();
    await initialTheme(page);
    expect(await theme(page)).toBe("light");
    await expect(page.getByRole("button", { name: "Switch to dark theme" })).toBeVisible();
  });

  test("stored preference beats the time schedule on every page", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("gx-theme", "light"));
    for (const r of ["/", "/products", "/contact"]) {
      await page.goto(r);
      await initialTheme(page);
      expect(await theme(page)).toBe("light");
    }
  });

  test("colours actually change between themes", async ({ page }) => {
    await page.goto("/");
    await ready(page);
    const bg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    const dark = await bg();
    await page.getByRole("button", { name: "Switch to light theme" }).click();
    await expect.poll(bg).not.toBe(dark);
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
    await ready(page);
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

  test("theme changes do not invoke document snapshot transitions", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await page.evaluate(() => {
      Object.defineProperty(document, "startViewTransition", { configurable: true, value: () => {
        throw new DOMException("Transition was aborted because of invalid state. Document hidden", "InvalidStateError");
      } });
    });
    await page.getByRole("button", { name: "Switch to light theme" }).click();
    await expect.poll(() => theme(page)).toBe("light");
    await expect(page.locator("html")).not.toHaveClass(/theme-anim/);
    expect(errors).toEqual([]);
  });
});
