import { expect, test } from "@playwright/test";

for (const width of [320, 360, 390, 430, 667]) {
  test(`promotion screen contains its artwork at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 820 });
    await page.goto("/");
    const banner = page.locator(".promo-switch-console");
    await banner.scrollIntoViewIfNeeded();
    const bounds = await banner.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width + 1);
    const screen = page.locator(".promo-switch-screen");
    expect(await screen.evaluate((element) => getComputedStyle(element).overflow)).toBe("hidden");
    expect(await screen.evaluate((element) => getComputedStyle(element).clipPath)).not.toBe("none");
    await page.getByRole("button", { name: "Next promotion", exact: true }).click();
    expect(await screen.evaluate((element) => getComputedStyle(element).clipPath)).not.toBe("none");
  });
}
