import { expect, test } from "@playwright/test";
import { imageLoading } from "@/lib/image-loading";
import { collectErrors, stubImages } from "./helpers";

test("loading intents are explicit and never combine preload with lazy loading", () => {
  expect(imageLoading("critical")).toEqual({ loading: "eager", fetchPriority: "high" });
  expect(imageLoading("visible")).toEqual({ loading: "eager" });
  expect(imageLoading("deferred")).toEqual({ loading: "lazy" });
});

test("banner slides remain eager on initial render and after advancing", async ({ page }) => {
  await stubImages(page);
  const errors = collectErrors(page);
  await page.goto("/");
  const banner = page.locator(".promo-switch-section");
  await expect(banner.locator('.promo-switch-slide[data-active="true"] img')).toHaveAttribute("loading", "eager");
  await banner.scrollIntoViewIfNeeded();
  await banner.getByRole("button", { name: "Next promotion" }).click();
  await expect(banner.locator('.promo-switch-slide[data-active="true"] img')).toHaveAttribute("loading", "eager");
  expect(errors).toEqual([]);
});
