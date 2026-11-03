import { expect, test } from "@playwright/test";
import { branches, mapsUrl } from "../../src/data/site";
import { branchChoices } from "../../src/lib/validation";

test("store links and enquiry choices use the three supplied branches", () => {
  expect(branches.map((branch) => branch.name)).toEqual(["Sungam Bypass Rd", "Karumbukkadai", "Pollachi"]);
  expect(branches.map(mapsUrl)).toEqual(["https://share.google/bvHfeXQzB58OvCfh7", "https://share.google/FX0kiUr25sfzvjfwi", "https://share.google/A4UN3avHiiTfG0ysa"]);
  expect(branchChoices).toEqual(["No preference", ...branches.map((branch) => branch.name)]);
});

test("Find a store opens the branch list with the supplied directions", async ({ page }) => {
  await page.goto("/policies");
  await page.locator("footer").getByRole("link", { name: "Find a store", exact: true }).click();
  await expect(page).toHaveURL(/\/contact#stores$/);
  for (const branch of branches) {
    const card = page.getByRole("region", { name: branch.name, exact: true });
    await expect(card.getByRole("heading", { name: branch.name, exact: true })).toBeVisible();
    await expect(card.getByRole("link", { name: "Directions", exact: true })).toHaveAttribute("href", branch.mapsUrl);
    await expect(card).toContainText("10 AM to 8 PM (All Days)");
  }
  await expect(page.getByLabel("Preferred branch")).toContainText("Pollachi");
  await expect(page.locator("#stores")).not.toContainText("Selvapuram");
});
