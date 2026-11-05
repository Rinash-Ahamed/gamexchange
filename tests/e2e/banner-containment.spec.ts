import { expect, test } from "@playwright/test";
import { stubImages } from "./helpers";

for (const width of [320, 360, 390, 430, 667]) {
  test(`promotion screen contains its artwork at ${width}px`, async ({ page }) => {
    await stubImages(page);
    await page.setViewportSize({ width, height: 820 });
    await page.goto("/");
    // Streamed Suspense fallback can temporarily coexist in hidden DOM with the real section.
    const promotion = page.locator('section[aria-labelledby="promo-switch-heading"]');
    const banner = promotion.locator(".promo-switch-console");
    await banner.scrollIntoViewIfNeeded();
    const bounds = await banner.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width + 1);
    const screen = promotion.locator(".promo-switch-screen");
    expect(await screen.evaluate((element) => getComputedStyle(element).overflow)).toBe("hidden");
    expect(await screen.evaluate((element) => getComputedStyle(element).clipPath)).not.toBe("none");
    await page.getByRole("button", { name: "Next promotion", exact: true }).click();
    expect(await screen.evaluate((element) => getComputedStyle(element).clipPath)).not.toBe("none");
  });
}
