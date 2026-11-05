import { expect, test } from "@playwright/test";
import { exchangeSchema } from "../../src/lib/validation";
import { buildEnquiryMessage } from "../../src/lib/enquiry-message";
import { stubImages } from "./helpers";
import { clearEditedField } from "../../src/lib/form-errors";

const enquiry = { kind: "exchange", console: "Other", condition: "Works perfectly", accessories: [], name: "Test Customer", phone: "9876543210", contactMethod: "WhatsApp", branch: "No preference" };

test("editing a field clears only that stale error without mutating the original", () => {
  const errors = { consoleOther: ["Enter a model"], phone: ["Enter a mobile number"] };
  expect(clearEditedField(errors, "consoleOther")).toEqual({ phone: errors.phone });
  expect(errors.consoleOther).toEqual(["Enter a model"]);
  expect(clearEditedField(errors, "unchanged")).toBe(errors);
});

test("Other requires a bounded model for both Sell and Exchange", () => {
  for (const intent of ["sell", "exchange"]) {
    for (const consoleOther of [undefined, "", "  ", "A", "A".repeat(121)]) expect(exchangeSchema.safeParse({ ...enquiry, intent, upgrade: "PlayStation 5", consoleOther }).success).toBe(false);
    const parsed = exchangeSchema.parse({ ...enquiry, intent, upgrade: "PlayStation 5", consoleOther: "  Nintendo\n Switch OLED " });
    expect(parsed.consoleOther).toBe("Nintendo Switch OLED");
    expect(buildEnquiryMessage(parsed)).toContain("Current console: Nintendo Switch OLED");
    expect(buildEnquiryMessage(parsed)).not.toContain("Current console: Other");
  }
  expect(exchangeSchema.safeParse({ ...enquiry, intent: "sell", console: "PlayStation 5" }).success).toBe(true);
});

test("Other reveals its model field, blocks Next when empty and preserves it on Back", async ({ page }) => {
  await stubImages(page);
  await page.addInitScript(() => sessionStorage.setItem("gx-boot-seen", "1"));
  await page.goto("/exchange");
  const form = page.getByRole("form", { name: "Sell or exchange enquiry" });
  const model = form.getByLabel("Your console model", { exact: true });
  await expect(model).toHaveCount(0);
  await form.getByRole("radio", { name: "Other", exact: true }).check();
  await expect(model).toBeVisible();
  await form.getByRole("button", { name: "Next", exact: true }).click();
  await expect(model).toBeFocused();
  await expect(model).toHaveAttribute("aria-invalid", "true");
  await model.fill("Nintendo Switch OLED");
  await expect(model).toHaveAttribute("aria-invalid", "false");
  await form.getByRole("button", { name: "Next", exact: true }).click();
  await expect(form.getByRole("heading", { name: "What condition is it in?" })).toBeVisible();
  await form.getByRole("button", { name: "Back", exact: true }).click();
  await expect(model).toHaveValue("Nintendo Switch OLED");
  await form.getByRole("radio", { name: "PlayStation 5", exact: true }).check();
  await expect(model).toHaveCount(0);
  await form.getByRole("radio", { name: "Other", exact: true }).check();
  await expect(model).toHaveValue("");
});
