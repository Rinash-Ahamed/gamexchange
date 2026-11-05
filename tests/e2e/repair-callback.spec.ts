import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { indianMobileSchema } from "../../src/lib/phone";
import { contactSchema, repairSchema } from "../../src/lib/validation";
import { turnstileResultMatches } from "../../src/lib/turnstile-policy";
import { stubImages } from "./helpers";

const repair = { kind: "repair", category: "Console", device: "PlayStation 5 Standard", name: "Fixture Customer", phone: "9876543210", contactMethod: "Phone call", fault: ["Power issues"], details: "The console will not turn on.", branch: "No preference" };

test("shared mobile validation normalizes prefixes and rejects malformed numbers in both forms", () => {
  for (const phone of ["9876543210", "+91 98765 43210", "91-9876543210"]) {
    expect(indianMobileSchema.parse(phone)).toBe("9876543210");
    expect(repairSchema.parse({ ...repair, phone }).phone).toBe("9876543210");
    expect(contactSchema.parse({ ...repair, kind: "contact", contactTopic: "General enquiry", message: "Please call about a repair.", phone }).phone).toBe("9876543210");
  }
  for (const phone of ["", "123", "5876543210", "98765432100", "98765abc10", "+1 9876543210", " ".repeat(30) + "9876543210"]) {
    expect(indianMobileSchema.safeParse(phone).success).toBe(false);
    expect(repairSchema.safeParse({ ...repair, phone }).success).toBe(false);
    expect(contactSchema.safeParse({ ...repair, kind: "contact", contactTopic: "General enquiry", message: "Please call about a repair.", phone }).success).toBe(false);
  }
});

test("WhatsApp repairs remain compatible and callbacks require consent and a stable UUID", () => {
  expect(repairSchema.parse(repair).delivery).toBe("whatsapp");
  const callback = { ...repair, delivery: "callback", callbackRequestId: "00000000-0000-4000-8000-000000000001", callbackConsent: true };
  expect(repairSchema.safeParse(callback).success).toBe(true);
  for (const change of [{ callbackConsent: false }, { callbackConsent: "on" }, { callbackRequestId: undefined }, { callbackRequestId: "invalid" }]) expect(repairSchema.safeParse({ ...callback, ...change }).success).toBe(false);
});

test("Turnstile validation requires genuine success, matching action and an exact allowed host", () => {
  const good = { success: true, hostname: "gamexchange.co.in", action: "repair" };
  expect(turnstileResultMatches(good, "repair", ["gamexchange.co.in"])).toBe(true);
  for (const change of [{ success: false }, { success: "true" }, { hostname: "evil.example" }, { hostname: "gamexchange.co.in.evil.example" }, { action: "contact" }, { action: undefined }]) expect(turnstileResultMatches({ ...good, ...change }, "repair", ["gamexchange.co.in"])).toBe(false);
  expect(turnstileResultMatches(good, "repair", [])).toBe(false);
});

test("callback persistence and Turnstile stay server-side behind existing enquiry protections", () => {
  const route = readFileSync("src/app/api/enquiry/route.ts", "utf8");
  expect(route.indexOf("verifyToken(token)")).toBeLessThan(route.indexOf("saveRepairCallback(parsed.data)"));
  expect(route.indexOf("verifyTurnstile(body.turnstileToken")).toBeLessThan(route.indexOf("saveRepairCallback(parsed.data)"));
  const store = readFileSync("src/lib/repair-callback.ts", "utf8");
  expect(store).toContain('collection("serviceRecords").doc(id)');
  expect(store).toContain("runTransaction");
  expect(store).toContain("callbackFingerprint !== fingerprint");
  expect(store).toContain('status: "received"');
  const verify = readFileSync("src/lib/turnstile.ts", "utf8");
  expect(verify).toContain("https://challenges.cloudflare.com/turnstile/v0/siteverify");
  expect(verify).toContain('cache: "no-store"');
  expect(verify).toContain('return "unavailable"');
});

test("callback UI reports a saved reference without asking the customer to send WhatsApp", async ({ page }) => {
  await stubImages(page);
  await page.addInitScript(() => sessionStorage.setItem("gx-boot-seen", "1"));
  await page.route("https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit", (route) => route.fulfill({ contentType: "application/javascript", body: 'window.turnstile = { render: function(element, options) { queueMicrotask(function() { options.callback("fixture-challenge"); }); return "fixture-widget"; }, remove: function() {} };' }));
  await page.route("**/api/enquiry/token", (route) => route.fulfill({ json: { ok: true, token: "fixture-token" } }));
  await page.route("**/api/enquiry", async (route) => {
    const body = route.request().postDataJSON();
    expect(body.delivery).toBe("callback");
    expect(body.callbackConsent).toBe(true);
    expect(body.contactMethod).toBe("Phone call");
    expect(body.callbackRequestId).toMatch(/^[0-9a-f-]{36}$/);
    await route.fulfill({ json: { ok: true, callback: true, ticketNumber: "GX-FIXTURE-00000001" } });
  });
  await page.goto("/repair-service");
  const form = page.getByRole("form", { name: "Repair enquiry" });
  await form.getByLabel("Device category", { exact: true }).selectOption("Console");
  await form.getByLabel("Device model", { exact: true }).selectOption("PlayStation 5 Standard");
  await form.getByLabel("Power issues", { exact: true }).check();
  await form.getByLabel("Describe the issue", { exact: true }).fill("The console will not turn on.");
  await form.getByLabel("How would you like to contact us?", { exact: true }).selectOption("callback");
  await form.getByLabel("Your name", { exact: true }).fill("Fixture Customer");
  const phone = form.getByLabel("Mobile number", { exact: true });
  await phone.fill("123"); await phone.blur();
  await expect(phone).toHaveAttribute("aria-invalid", "true");
  await phone.fill("9876543210"); await phone.blur();
  await expect(phone).toHaveAttribute("aria-invalid", "false");
  await form.locator('[name="callbackConsent"]').check();
  await form.getByRole("button", { name: "Request a callback", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Callback requested", exact: true })).toBeVisible();
  await expect(page.getByText("Reference: GX-FIXTURE-00000001")).toBeVisible();
  await expect(page.getByRole("link", { name: "Send on WhatsApp", exact: true })).toHaveCount(0);
});

test("contact phone field gives immediate invalid-number feedback", async ({ page }) => {
  await stubImages(page);
  await page.addInitScript(() => sessionStorage.setItem("gx-boot-seen", "1"));
  await page.goto("/contact");
  const phone = page.getByRole("form", { name: "Contact form" }).getByLabel("Mobile number", { exact: true });
  await phone.fill("123abc"); await phone.blur();
  await expect(phone).toHaveAttribute("aria-invalid", "true");
  await phone.fill("+91 98765 43210"); await phone.blur();
  await expect(phone).toHaveAttribute("aria-invalid", "false");
});
