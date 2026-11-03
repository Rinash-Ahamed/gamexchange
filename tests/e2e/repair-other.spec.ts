import { expect, test } from "@playwright/test";
import { repairSchema } from "@/lib/validation";
import { buildEnquiryMessage } from "@/lib/enquiry-message";
import { stubImages } from "./helpers";

const enquiry = { kind: "repair", category: "Console", device: "Other", name: "Test Customer", phone: "9876543210", contactMethod: "WhatsApp", fault: ["Power issues"], details: "The device does not power on.", branch: "No preference" };

test("Other requires a bounded model for both repair categories", () => {
  for (const category of ["Console", "Accessories"]) {
    for (const deviceOther of [undefined, "", "  ", "A", "A".repeat(121)]) {
      const result = repairSchema.safeParse({ ...enquiry, category, deviceOther });
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error.issues.some((issue) => issue.path[0] === "deviceOther")).toBe(true);
    }
  }
});

test("custom model is normalized and included in the enquiry", () => {
  const parsed = repairSchema.parse({ ...enquiry, deviceOther: "  Nintendo\n Switch OLED  " });
  expect(parsed.deviceOther).toBe("Nintendo Switch OLED");
  expect(buildEnquiryMessage(parsed)).toContain("Device: Nintendo Switch OLED");
  expect(buildEnquiryMessage(parsed)).not.toContain("Device: Other");
});

test("listed models still work without custom text and reject unlisted dropdown values", () => {
  const parsed = repairSchema.parse({ ...enquiry, device: "PlayStation 5 Standard" });
  expect(buildEnquiryMessage(parsed)).toContain("Device: PlayStation 5 Standard");
  expect(repairSchema.safeParse({ ...enquiry, device: "unlisted", deviceOther: "Custom model" }).success).toBe(false);
});

test("Other reveals a model field that clears when the selection changes", async ({ page }) => {
  await stubImages(page);
  await page.addInitScript(() => sessionStorage.setItem("gx-boot-seen", "1"));
  await page.goto("/repair-service");
  const form = page.getByRole("form", { name: "Repair enquiry" });
  const model = form.getByLabel("Your device model", { exact: true });
  await form.getByLabel("Device category", { exact: true }).selectOption("Console");
  await expect(model).toHaveCount(0);
  await form.getByLabel("Device model", { exact: true }).selectOption("Other");
  await expect(model).toBeVisible();
  await expect(model).toHaveAttribute("maxlength", "120");
  await expect(model).toHaveAttribute("required", "");
  await model.fill("Nintendo Switch OLED");
  await form.getByLabel("Device model", { exact: true }).selectOption("PlayStation 5 Standard");
  await expect(model).toHaveCount(0);
  await form.getByLabel("Device category", { exact: true }).selectOption("Accessories");
  await form.getByLabel("Device model", { exact: true }).selectOption("Other");
  await expect(model).toBeVisible();
  await expect(model).toHaveValue("");
});
