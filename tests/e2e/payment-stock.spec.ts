import { expect, test } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { paymentStockHarness } from "../helpers/payment-stock-harness";
import { checkoutPrivacyNotice } from "../../src/lib/payments/privacy-consent";
import { changeTestStock } from "../../src/lib/payments/stock-policy";

const customer = { uid: "fixture-customer", email: "fixture@example.com" };
function input(ids = ["last-console"]) {
  return {
    requestId: randomUUID(), items: ids.map((id) => ({ id, quantity: 1 })), expectedAmount: ids.length * 10000,
    shipping: { name: "Fixture Customer", phone: "9876543210", addressLine1: "123 Fixture Road", addressLine2: "", city: "Coimbatore", state: "Tamil Nadu", postalCode: "641001", country: "IN" as const },
    privacyConsent: { accepted: true as const, version: checkoutPrivacyNotice.version },
  };
}

test("competing last-unit requests produce one hold and one gateway order", async () => {
  const h = paymentStockHarness(); h.seed("last-console");
  const outcomes = await Promise.allSettled([h.orders.createTestOrder(input(), customer), h.orders.createTestOrder(input(), customer)]);
  expect(outcomes.filter((outcome) => outcome.status === "fulfilled")).toHaveLength(1);
  expect(h.stock()).toEqual([{ capacity: 1, held: 1, sold: 0 }]);
  expect(h.gatewayCalls.filter((path) => path === "orders")).toHaveLength(1);
  expect(h.records.get("inventory/last-console")?.stock).toBe(1);
});

test("same checkout request and concurrent callback/webhook cannot double-consume or email", async () => {
  const h = paymentStockHarness(); h.seed("last-console"); const request = input();
  await h.orders.createTestOrder(request, customer);
  await h.orders.createTestOrder(request, customer);
  expect(h.gatewayCalls.filter((path) => path === "orders")).toHaveLength(1);
  const payment = h.payment(request.requestId);
  await Promise.all([h.orders.verifyTestOrder(payment, customer), h.orders.reconcileTestPayment(payment.razorpay_payment_id, payment.razorpay_order_id), h.orders.verifyTestOrder(payment, customer)]);
  expect(h.stock()).toEqual([{ capacity: 1, held: 0, sold: 1 }]);
  expect(h.savedOrder(request.requestId)?.history).toHaveLength(1);
  expect([...h.records.keys()].filter((path) => path.startsWith("orderEmails/"))).toHaveLength(2);
  expect([...h.records.keys()].filter((path) => path.startsWith("checkoutTestPayments/"))).toHaveLength(1);
  await expect(h.orders.createTestOrder(input(), customer)).rejects.toThrow("sold out");
});

test("a rejected cart and changed UUID payload cannot leave partial holds", async () => {
  const h = paymentStockHarness(); h.seed("last-console"); h.seed("unavailable", 0);
  await expect(h.orders.createTestOrder(input(["last-console", "unavailable"]), customer)).rejects.toThrow("no longer available");
  expect(h.stock()).toEqual([]);
  expect(h.gatewayCalls).toEqual([]);
  const request = input(); await h.orders.createTestOrder(request, customer);
  await expect(h.orders.createTestOrder({ ...request, expectedAmount: 1 }, customer)).rejects.toThrow("details changed");
  await expect(h.orders.createTestOrder(request, { ...customer, uid: "another-customer" })).rejects.toThrow("details changed");
  expect(h.stock()).toEqual([{ capacity: 1, held: 1, sold: 0 }]);
});

test("forged success, wrong customer and authorized-only payment do not sell stock", async () => {
  const h = paymentStockHarness(); h.seed("last-console"); const request = input();
  await h.orders.createTestOrder(request, customer); const payment = h.payment(request.requestId, "authorized");
  await expect(h.orders.verifyTestOrder({ ...payment, razorpay_signature: "0".repeat(64) }, customer)).rejects.toThrow("signature");
  await expect(h.orders.verifyTestOrder(payment, { ...customer, uid: "another-customer" })).rejects.toThrow("signature");
  await expect(h.orders.verifyTestOrder(payment, customer)).rejects.toThrow("not captured");
  expect(h.stock()).toEqual([{ capacity: 1, held: 1, sold: 0 }]);
  expect([...h.records.keys()].filter((path) => path.startsWith("orderEmails/"))).toHaveLength(0);
});

test("expired unpaid holds release once after provider checks, not just the timer", async () => {
  const h = paymentStockHarness(); h.seed("last-console"); const request = input();
  await h.orders.createTestOrder(request, customer); h.expire(request.requestId);
  await Promise.all([h.orders.reconcileTestReservations(), h.orders.reconcileTestReservations()]);
  expect(h.savedOrder(request.requestId)?.reservation?.status).toBe("released");
  expect(h.stock()).toEqual([{ capacity: 1, held: 0, sold: 0 }]);
  await expect(h.orders.createTestOrder(request, customer)).rejects.toThrow("expired");
  await h.orders.createTestOrder(input(), customer);
  expect(h.stock()).toEqual([{ capacity: 1, held: 1, sold: 0 }]);
});

test("payment totals, refunds and missing refund state fail closed", async () => {
  for (const change of [{ amount: 1 }, { currency: "USD" }, { amount_refunded: 1 }, { amount_refunded: undefined }]) {
    const h = paymentStockHarness(); h.seed("last-console"); const request = input();
    await h.orders.createTestOrder(request, customer); const payment = h.payment(request.requestId);
    h.payments.set(payment.razorpay_payment_id, { ...h.payments.get(payment.razorpay_payment_id), ...change });
    await expect(h.orders.verifyTestOrder(payment, customer)).rejects.toThrow();
    expect(h.stock()).toEqual([{ capacity: 1, held: 1, sold: 0 }]);
    expect(h.savedOrder(request.requestId)?.status).toBe("created");
  }
});

test("authorized, uncertain creation and provider outages retain holds", async () => {
  for (const failure of ["authorized", "creation", "outage"] as const) {
    const h = paymentStockHarness(); h.seed("last-console"); const request = input();
    if (failure === "creation") h.failCreation();
    await h.orders.createTestOrder(request, customer).catch(() => undefined);
    if (failure === "authorized") h.payment(request.requestId, "authorized");
    if (failure === "outage") h.failGateway();
    h.expire(request.requestId);
    const result = await h.orders.reconcileTestReservations();
    expect(result.ok).toBe(failure !== "outage");
    expect(h.stock()).toEqual([{ capacity: 1, held: 1, sold: 0 }]);
    expect(h.savedOrder(request.requestId)?.reservation?.status).toBe("held");
  }
});

test("missed browser callback is recovered from captured gateway state before releasing", async () => {
  const h = paymentStockHarness(); h.seed("last-console"); const request = input();
  await h.orders.createTestOrder(request, customer); h.payment(request.requestId); h.expire(request.requestId);
  expect((await h.orders.reconcileTestReservations()).ok).toBe(true);
  expect(h.savedOrder(request.requestId)?.status).toBe("paid");
  expect(h.stock()).toEqual([{ capacity: 1, held: 0, sold: 1 }]);
});

test("expiry reconciliation racing a valid callback still consumes just once", async () => {
  const h = paymentStockHarness(); h.seed("last-console"); const request = input();
  await h.orders.createTestOrder(request, customer); h.expire(request.requestId);
  const payment = h.payment(request.requestId);
  await Promise.all([h.orders.reconcileTestReservations(), h.orders.verifyTestOrder(payment, customer)]);
  expect(h.stock()).toEqual([{ capacity: 1, held: 0, sold: 1 }]);
  expect(h.savedOrder(request.requestId)?.status).toBe("paid");
  expect([...h.records.keys()].filter((path) => path.startsWith("orderEmails/"))).toHaveLength(2);
});

test("late capture cannot consume another customer's hold or partially fulfil a cart", async () => {
  const h = paymentStockHarness(); h.seed("last-console"); h.seed("second-console");
  const first = input(["last-console", "second-console"]);
  await h.orders.createTestOrder(first, customer); h.expire(first.requestId);
  await h.orders.reconcileTestReservations();
  const second = input(); await h.orders.createTestOrder(second, customer);
  const before = h.stock(); const payment = h.payment(first.requestId);
  await expect(h.orders.verifyTestOrder(payment, customer)).rejects.toThrow("stock review");
  await h.orders.reconcileTestPayment(payment.razorpay_payment_id, payment.razorpay_order_id);
  expect(h.savedOrder(first.requestId)?.status).toBe("payment_review");
  expect(h.savedOrder(first.requestId)?.fulfillmentStatus).toBeUndefined();
  expect(h.stock()).toEqual(before);
  expect([...h.records.keys()].filter((path) => path.startsWith("orderEmails/"))).toHaveLength(0);
});

test("late capture can safely consume still-free capacity once", async () => {
  const h = paymentStockHarness(); h.seed("last-console"); const request = input();
  await h.orders.createTestOrder(request, customer); h.expire(request.requestId);
  await h.orders.reconcileTestReservations(); const payment = h.payment(request.requestId);
  await h.orders.verifyTestOrder(payment, customer); await h.orders.verifyTestOrder(payment, customer);
  expect(h.stock()).toEqual([{ capacity: 1, held: 0, sold: 1 }]);
});

test("stock counters reject corruption and cannot use capacity held by someone else", () => {
  expect(changeTestStock({ capacity: 1, held: 1, sold: 0 }, 1, "consume-free")).toBeNull();
  expect(() => changeTestStock({ capacity: 1, held: 0, sold: 0 }, 1, "release")).toThrow();
  expect(() => changeTestStock({ capacity: 1, held: -1, sold: 0 }, 1, "hold")).toThrow();
});

test("stock reservation worker requires scheduler authorization", async ({ request }) => {
  const response = await request.get("/api/internal/checkout-reservations");
  expect(response.status()).toBe(401);
});
