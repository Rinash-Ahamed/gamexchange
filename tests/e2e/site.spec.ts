import { expect, test } from "@playwright/test";
import { collectErrors, stubImages } from "./helpers";

const routes = ["/", "/products", "/exchange", "/repair-service", "/game-zone", "/contact"];

test.beforeEach(async ({ page }) => { await stubImages(page); });

for (const route of routes) {
  test(`${route}: renders, no console errors, no horizontal overflow`, async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
    await page.waitForLoadState("networkidle");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });
}

test("navigation reaches every page and marks the current one", async ({ page, isMobile }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Primary" }).filter({ visible: true });
  for (const [name, path] of [["Shop", "/products"], ["Repair", "/repair-service"], ["Contact", "/contact"]] as const) {
    await nav.getByRole("link", { name: isMobile ? new RegExp(name, "i") : name }).first().click();
    await expect(page).toHaveURL(path);
    await expect(nav.locator('[aria-current="page"]')).toHaveCount(1);
  }
});

test("shop: filter and sort update the product list", async ({ page }) => {
  await page.goto("/products");
  await expect(page.getByRole("status").filter({ hasText: "Showing 4 products" })).toBeVisible();
  await page.getByRole("radio", { name: "PlayStation 2" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Showing 1 product" })).toBeVisible();
  await page.getByRole("radio", { name: "All" }).click();
  await page.getByLabel("Sort").selectOption("price-asc");
  await expect(page.locator("article h3").first()).toHaveText(/PlayStation 2 Slimline/i);
});

test("repair form: validates, then reaches an honest 'ready to send' state", async ({ page }) => {
  await page.goto("/repair-service");
  await page.getByRole("button", { name: "Prepare enquiry" }).click();
  await expect(page.getByText("Enter your name")).toBeVisible();
  await expect(page.locator("form [role=alert]")).toContainText("fix the highlighted fields");

  await page.getByLabel("Device category").selectOption("Console");
  await page.getByLabel("Device model").selectOption("PlayStation 4 Slim");
  await page.getByRole("button", { name: "HDMI port" }).click();
  await page.getByLabel("Describe the issue").fill("No picture on the TV, HDMI cable already replaced.");
  await page.getByLabel("Your name").fill("Test User");
  await page.getByLabel("Mobile number").fill("98765 43210");
  await page.getByRole("button", { name: "Prepare enquiry" }).click();

  const status = page.getByRole("status").filter({ hasText: "Repair enquiry ready" });
  await expect(status).toBeVisible();
  await expect(status).toContainText("Nothing is booked or confirmed");
  await expect(status.getByRole("link", { name: "Send on WhatsApp" })).toHaveAttribute("href", /^https:\/\/wa\.me\/917708845461\?text=/);

  await status.getByRole("button", { name: "Edit enquiry" }).click();
  await expect(page.getByLabel("Your name")).toHaveValue("Test User");
});

test("exchange wizard: gates each step and submits", async ({ page }) => {
  await page.goto("/exchange");
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByText("Choose your console")).toBeVisible();

  await page.getByRole("group", { name: "Current console" }).getByText("PlayStation 4", { exact: true }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByText("Works perfectly").click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByText("Controller", { exact: true }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("group", { name: "Desired upgrade" }).getByText("PlayStation 5", { exact: true }).click();
  await page.getByRole("button", { name: "Next" }).click();

  await page.getByLabel("Your name").fill("Test User");
  await page.getByLabel("Mobile number").fill("9" + String(Math.floor(Math.random() * 1e9)).padStart(9, "0"));
  await page.getByRole("button", { name: "Prepare enquiry" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Exchange enquiry ready" })).toBeVisible({ timeout: 12_000 });
});

test("game zone: pricing shown and gallery moves (pinned on desktop, native rail on touch)", async ({ page, isMobile }) => {
  await page.goto("/game-zone");
  await expect(page.getByText("₹170").filter({ visible: true }).first()).toBeVisible();
  if (isMobile) {
    const rail = page.getByRole("region", { name: /Game zone gallery/ });
    const before = await rail.evaluate((el) => el.scrollLeft);
    await page.getByRole("button", { name: "Next" }).click();
    await expect.poll(() => rail.evaluate((el) => el.scrollLeft)).toBeGreaterThan(before);
  } else {
    const track = page.locator(".will-change-transform").filter({ has: page.locator("img, h3, h2") }).last();
    const xOf = () => track.evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m41);
    const runway = page.locator("div.relative.h-\\[300vh\\]");
    await runway.scrollIntoViewIfNeeded();
    const start = await xOf();
    await runway.evaluate((el) => window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + (el as HTMLElement).offsetHeight * 0.6, behavior: "instant" }));
    await expect.poll(xOf).toBeLessThan(start - 200);
  }
});

test("FAQ accordion toggles", async ({ page }) => {
  await page.goto("/");
  const q = page.getByRole("button", { name: "How long do repairs take?" });
  await q.click();
  await expect(q).toHaveAttribute("aria-expanded", "true");
  await q.click();
  await expect(q).toHaveAttribute("aria-expanded", "false");
});
