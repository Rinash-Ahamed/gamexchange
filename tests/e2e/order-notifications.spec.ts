import { expect, test } from "@playwright/test";
import { nextOrderStage, orderStages } from "../../src/lib/orders/tracking";
import { canRetryEmail, normalizedEmail, orderEmailId, sameMailbox } from "../../src/lib/orders/notification-policy";
import { orderEmailTemplate } from "../../src/lib/orders/email-template";
import type { TestOrder } from "../../src/lib/payments/orders";

const order: TestOrder = {
  id: "00000000-0000-4000-8000-000000000001", mode: "test", keyId: "test", fingerprint: "fixture", status: "paid", amount: 10000, currency: "INR",
  createdAt: "2026-11-05T06:00:00.000Z", updatedAt: "2026-11-05T06:00:00.000Z", paymentId: "pay_fixture",
  customer: { uid: "fixture", email: "customer@example.com" }, items: [{ id: "fixture", name: '<script>alert("unsafe")</script>', quantity: 2, unitAmount: 5000 }],
  shipping: { name: "Sample Customer", phone: "9876543210", addressLine1: "123 Example Road", addressLine2: "", city: "Coimbatore", state: "Tamil Nadu", postalCode: "641001", country: "IN" },
};
test("one deterministic job per order/event and independent jobs for different orders", () => {
  expect(orderEmailId(order.id, "confirmation")).toBe(orderEmailId(order.id, "confirmation"));
  expect(orderEmailId(order.id, "shipment")).not.toBe(orderEmailId(order.id, "confirmation"));
  expect(orderEmailId("another-order", "confirmation")).not.toBe(orderEmailId(order.id, "confirmation"));
});
test("normalize duplicate recipients and reject invalid mailbox headers", () => {
  expect(sameMailbox(" Customer@Example.com ", "customer@example.com")).toBe(true);
  expect(sameMailbox("", "")).toBe(false);
  expect(sameMailbox("sample.name+orders@gmail.com", "samplename@googlemail.com")).toBe(true);
  expect(sameMailbox("sample.name@example.com", "samplename@example.com")).toBe(false);
  expect(normalizedEmail("customer@example.com\r\nBcc: other@example.com")).toBe("");
});
test("sent and uncertain messages cannot be automatically or manually retried", () => {
  for (const status of ["sent", "sending", "uncertain", "suppressed"]) expect(canRetryEmail(status)).toBe(false);
  for (const status of ["pending", "failed", "blocked"]) expect(canRetryEmail(status)).toBe(true);
});
test("fulfilment follows the four forward stages and ends at delivered", () => {
  expect(orderStages).toEqual(["Order Placed", "Packed", "Parcel Sent", "Delivered"]);
  expect(nextOrderStage("Order Placed")).toBe("Packed");
  expect(nextOrderStage("Packed")).toBe("Parcel Sent");
  expect(nextOrderStage("Parcel Sent")).toBe("Delivered");
  expect(nextOrderStage("Delivered")).toBeUndefined();
});
test("templates escape customer data, include required receipts and label sandbox", () => {
  for (const kind of ["confirmation", "admin", "shipment"] as const) {
    const email = orderEmailTemplate(order, kind, { carrier: "Test courier", trackingNumber: "TEST123", trackingUrl: "https://example.com/tracking" });
    expect(email.html).not.toContain("<script>");
    expect(email.html).toContain("&lt;script&gt;");
    expect(email.html).toContain("cid:gamexchange-logo");
    expect(email.text).toContain(order.id);
    expect(email.text).toContain("Payment status: Captured (test)");
    expect(email.text).toContain("641001");
    expect(email.subject).toContain("TEST");
    if (kind === "shipment") expect(email.text).toContain("TEST123");
  }
});
test("email worker is not publicly callable", async ({ request }) => {
  const response = await request.get("/api/internal/order-emails");
  expect(response.status()).toBe(401);
});
