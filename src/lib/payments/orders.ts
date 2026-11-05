import "server-only";

import { createHash } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { after } from "next/server";
import { enqueueOrderEmail, dispatchOrderEmails } from "@/lib/orders/outbox";
import type { OrderTracking } from "@/lib/orders/tracking";
import { z } from "zod";
import { firebaseFirestore } from "@/lib/firebase/firestore";
import { isPcComponentCategory } from "@/data/catalog";
import type { InventoryItem } from "@/lib/admin/types";
import { CheckoutError, gatewayOrderSchema, gatewayPaymentSchema, razorpayRequest, testCredentials, validSignature } from "./razorpay";
import { shippingSchema, type CheckoutCustomer, type ShippingAddress } from "./shipping";
import { checkoutPrivacyConsentSchema } from "./privacy-consent";
import { changeTestStock, reservationDurationMs } from "./stock-policy";
import { planTestStock, readTestStock, testPaymentId } from "./reservation-stock";

export const checkoutSchema = z.object({
  requestId: z.uuid(),
  items: z.array(z.object({ id: z.string().regex(/^[a-zA-Z0-9-]{1,128}$/), quantity: z.number().int().min(1).max(99) })).min(1).max(30),
  expectedAmount: z.number().int().positive().max(100_000_000),
  shipping: shippingSchema,
  privacyConsent: checkoutPrivacyConsentSchema,
}).refine((value) => new Set(value.items.map((item) => item.id)).size === value.items.length, "Duplicate products are not allowed.");
export const verifySchema = z.object({ requestId: z.uuid(), razorpay_order_id: z.string().regex(/^order_[a-zA-Z0-9]+$/), razorpay_payment_id: z.string().regex(/^pay_[a-zA-Z0-9]+$/), razorpay_signature: z.string().regex(/^[a-fA-F0-9]{64}$/) });
export type TestOrder = OrderTracking & {
  id: string; mode: "test"; keyId: string; fingerprint: string; status: "creating" | "created" | "paid" | "payment_review";
  amount: number; currency: "INR"; items: { id: string; name: string; quantity: number; unitAmount: number }[];
  createdAt: string; updatedAt: string; razorpayOrderId?: string; paymentId?: string;
  customer?: CheckoutCustomer; shipping?: ShippingAddress;
  privacyConsent?: { accepted: true; version: string; acceptedAt: string };
  reservation?: { status: "held" | "consumed" | "released"; expiresAt: number };
  reservationCheckAt?: number; reservationNote?: string;
};
const collection = () => firebaseFirestore().collection("checkoutTestOrders");
const fingerprint = (input: z.infer<typeof checkoutSchema>, customer: CheckoutCustomer) => createHash("sha256").update(JSON.stringify({ uid: customer.uid, shipping: input.shipping, privacyConsent: input.privacyConsent, amount: input.expectedAmount, items: [...input.items].sort((a, b) => a.id.localeCompare(b.id)) })).digest("hex");
function checkoutResponse(order: TestOrder) {
  if (order.status === "paid") throw new CheckoutError("This test order is already paid. Check your order reference.", 409);
  if (order.status === "payment_review") throw new CheckoutError("Payment needs stock review. Do not pay again; contact the team with your order reference.", 409);
  if (!order.reservation || order.reservation.status !== "held" || order.reservation.expiresAt <= Date.now()) throw new CheckoutError("This checkout hold has expired. Refresh your cart to start again. If you paid, do not pay again; contact the team.", 409);
  if (!order.razorpayOrderId) throw new CheckoutError("This checkout is still being prepared. Please retry shortly.", 409);
  return { requestId: order.id, key: order.keyId, orderId: order.razorpayOrderId, amount: order.amount, currency: order.currency, expiresAt: order.reservation.expiresAt, mode: "test" as const };
}

export async function createTestOrder(input: z.infer<typeof checkoutSchema>, customer: CheckoutCustomer) {
  const credentials = testCredentials();
  const ref = collection().doc(input.requestId);
  const hash = fingerprint(input, customer);
  const db = firebaseFirestore();
  const claimed = await db.runTransaction(async (transaction) => {
    const existing = (await transaction.get(ref)).data() as TestOrder | undefined;
    if (existing) {
      if (existing.mode !== "test" || existing.customer?.uid !== customer.uid || existing.fingerprint !== hash || existing.keyId !== credentials.key) throw new CheckoutError("Checkout details changed. Start a new checkout.", 409);
      return { order: existing, fresh: false };
    }
    // Price, availability, shared counters and order creation are one atomic transaction.
    const documents = await transaction.getAll(...input.items.map((line) => db.collection("inventory").doc(line.id)));
    const rows = await readTestStock(db, transaction, credentials.key, input.items);
    const plans = rows.map((row, index) => {
      const product = documents[index]?.data() as InventoryItem | undefined;
      if (!product || product.status !== "active" || !Number.isSafeInteger(product.stock) || product.stock < row.line.quantity || isPcComponentCategory(product.category)) throw new CheckoutError("Some items are no longer available in the requested quantity. Refresh your cart.", 409);
      if (!Number.isSafeInteger(product.price) || product.price <= 0) throw new CheckoutError("One item needs a price confirmation. Contact the team.", 409);
      const stock = changeTestStock(row.stock ?? { capacity: product.stock, held: 0, sold: 0 }, row.line.quantity, "hold", product.stock);
      if (!stock) throw new CheckoutError("An item is sold out or temporarily reserved by another customer. Please try again later.", 409);
      return { ref: row.ref, stock, item: { id: row.line.id, name: product.name, quantity: row.line.quantity, unitAmount: product.price * 100 } };
    });
    const amount = plans.reduce((sum, plan) => sum + plan.item.unitAmount * plan.item.quantity, 0);
    if (!Number.isSafeInteger(amount) || amount !== input.expectedAmount) throw new CheckoutError("Prices changed. Refresh your cart before continuing.", 409);
    const now = new Date().toISOString();
    const expiresAt = Date.now() + reservationDurationMs;
    const order: TestOrder = { id: input.requestId, mode: "test", keyId: credentials.key, fingerprint: hash, status: "creating", amount, currency: "INR", items: plans.map((plan) => plan.item), customer, shipping: input.shipping, privacyConsent: { ...input.privacyConsent, acceptedAt: now }, createdAt: now, updatedAt: now, reservation: { status: "held", expiresAt }, reservationCheckAt: expiresAt };
    for (const plan of plans) transaction.set(plan.ref, plan.stock);
    transaction.create(ref, order);
    return { order, fresh: true };
  });
  const { order } = claimed;
  if (!claimed.fresh) return checkoutResponse(order);
  const amount = order.amount;
  // Leave an uncertain create in 'creating', rather than risk duplicate gateway orders on retry.
  const gateway = gatewayOrderSchema.parse(await razorpayRequest("orders", { amount, currency: "INR", receipt: input.requestId, partial_payment: false, notes: { gxc_test_id: input.requestId, mode: "test" } }));
  if (gateway.amount !== amount || gateway.currency !== "INR" || gateway.receipt !== input.requestId) throw new CheckoutError("Checkout could not be validated.", 502);
  await ref.update({ status: "created", razorpayOrderId: gateway.id, updatedAt: new Date().toISOString() });
  return checkoutResponse({ ...order, status: "created", razorpayOrderId: gateway.id });
}

async function confirmCaptured(order: TestOrder, paymentId: string) {
  const { key } = testCredentials();
  if (order.mode !== "test" || order.keyId !== key) throw new CheckoutError("This checkout belongs to another test configuration.", 409);
  const payment = gatewayPaymentSchema.parse(await razorpayRequest(`payments/${paymentId}`));
  if (payment.id !== paymentId || payment.order_id !== order.razorpayOrderId || payment.amount !== order.amount || payment.currency !== "INR" || payment.amount_refunded !== 0) throw new CheckoutError("Payment details do not match this test order.", 400);
  if (payment.status !== "captured") throw new CheckoutError("Payment is not captured yet. Retry verification shortly. Do not pay again.", 409);
  const db = firebaseFirestore();
  const outcome = await db.runTransaction(async (transaction) => {
    const ref = collection().doc(order.id);
    const current = (await transaction.get(ref)).data() as TestOrder | undefined;
    if (!current || current.mode !== "test" || current.keyId !== key || current.razorpayOrderId !== payment.order_id || current.amount !== payment.amount || current.currency !== payment.currency) throw new CheckoutError("Test order could not be verified.", 409);
    const claimRef = db.collection("checkoutTestPayments").doc(testPaymentId(key, paymentId));
    const claim = (await transaction.get(claimRef)).data();
    if (claim && claim.orderId !== current.id) throw new CheckoutError("This payment is already associated with another order.", 409);
    if (current.status === "paid" || current.status === "payment_review") {
      if (current.paymentId !== paymentId) throw new CheckoutError("This order has a different payment.", 409);
      if (!claim) transaction.create(claimRef, { orderId: current.id, paymentId, keyId: key });
      return current.status;
    }
    if (current.reservation?.status === "consumed") throw new CheckoutError("Order and stock state need manual reconciliation. Do not pay again.", 409);
    const rows = current.reservation ? await readTestStock(db, transaction, key, current.items) : [];
    const plans = current.reservation ? planTestStock(rows, current.reservation.status === "held" ? "consume-held" : "consume-free") : [];
    const now = new Date().toISOString();
    if (!claim) transaction.create(claimRef, { orderId: current.id, paymentId, keyId: key });
    // A delayed capture can use released capacity only if the entire cart still fits.
    // Otherwise record the payment, but never confirm fulfilment or queue success emails.
    if (!current.reservation || plans.some((plan) => !plan.stock)) {
      transaction.update(ref, { status: "payment_review", paymentId, paidAt: now, updatedAt: now, reservationCheckAt: FieldValue.delete(), reservationNote: "Captured test payment needs manual stock/refund review. Do not fulfil or pay again." });
      return "payment_review";
    }
    for (const plan of plans) transaction.set(plan.ref, plan.stock!);
    transaction.update(ref, { status: "paid", paymentId, paidAt: now, fulfillmentStatus: "Order Placed", history: [{ status: "Order Placed", at: now, actor: "payment-verification" }], updatedAt: now, reservation: { ...current.reservation, status: "consumed" }, reservationCheckAt: FieldValue.delete(), reservationNote: FieldValue.delete() });
    const paid: TestOrder = { ...current, status: "paid", paymentId, paidAt: now };
    enqueueOrderEmail(transaction, paid, "confirmation");
    enqueueOrderEmail(transaction, paid, "admin");
    return "paid";
  });
  if (outcome === "paid") after(() => dispatchOrderEmails(order.id));
  return { ok: outcome === "paid", mode: "test", reference: order.id, review: outcome === "payment_review" };
}

export async function verifyTestOrder(input: z.infer<typeof verifySchema>, customer: CheckoutCustomer) {
  const { secret } = testCredentials();
  const order = (await collection().doc(input.requestId).get()).data() as TestOrder | undefined;
  if (order?.customer?.uid !== customer.uid || !order?.razorpayOrderId || order.razorpayOrderId !== input.razorpay_order_id ||
    !validSignature(`${order.razorpayOrderId}|${input.razorpay_payment_id}`, input.razorpay_signature, secret)) throw new CheckoutError("Payment signature could not be verified.", 400);
  const result = await confirmCaptured(order, input.razorpay_payment_id);
  if (result.review) throw new CheckoutError(`Payment was received but needs stock review. Do not pay again; contact the team. Reference: ${order.id}`, 409);
  return result;
}

export async function reconcileTestPayment(paymentId: string, orderId: string) {
  const records = await collection().where("razorpayOrderId", "==", orderId).limit(1).get();
  const order = records.docs[0]?.data() as TestOrder | undefined;
  if (!order) return; // Other integrations' test orders are not ours to change.
  await confirmCaptured(order, paymentId);
}

export async function listTestOrders() {
  const result = await collection().orderBy("createdAt", "desc").limit(50).get();
  return result.docs.map((document) => document.data() as TestOrder);
}

const orderPaymentsSchema = z.object({ count: z.number().int().nonnegative(), items: z.array(gatewayPaymentSchema) });

async function reconcileReservation(order: TestOrder) {
  const { key } = testCredentials();
  // No gateway ID can mean creation succeeded remotely before the connection failed.
  // Never free this uncertain hold automatically or create a second gateway order.
  if (order.mode !== "test" || order.keyId !== key || !order.razorpayOrderId) {
    await deferReservation(order.id, "Gateway creation/configuration needs manual reconciliation; stock remains held.");
    return;
  }
  const gateway = gatewayOrderSchema.parse(await razorpayRequest(`orders/${order.razorpayOrderId}`));
  const payments = orderPaymentsSchema.parse(await razorpayRequest(`orders/${order.razorpayOrderId}/payments`));
  if (gateway.id !== order.razorpayOrderId || gateway.receipt !== order.id || gateway.amount !== order.amount || gateway.currency !== order.currency || payments.items.some((payment) => payment.order_id !== gateway.id)) throw new Error("Gateway reservation reconciliation mismatch.");
  const captured = payments.items.find((payment) => payment.status === "captured");
  if (captured) { await confirmCaptured(order, captured.id); return; }
  // Missing/partial responses, an authorized payment or a still-processing attempt
  // must not be interpreted as an unpaid order. Check again later, failing closed.
  if (payments.count !== payments.items.length || !["created", "attempted"].includes(gateway.status) || payments.items.some((payment) => payment.status !== "failed")) {
    await deferReservation(order.id, "Payment may still be processing. Stock remains held until reconciliation.");
    return;
  }
  const db = firebaseFirestore();
  await db.runTransaction(async (transaction) => {
    const ref = collection().doc(order.id);
    const current = (await transaction.get(ref)).data() as TestOrder | undefined;
    if (!current || current.status === "paid" || current.status === "payment_review" || current.reservation?.status !== "held" || current.reservation.expiresAt > Date.now() || current.razorpayOrderId !== gateway.id || current.keyId !== key) return;
    const plans = planTestStock(await readTestStock(db, transaction, key, current.items), "release");
    for (const plan of plans) transaction.set(plan.ref, plan.stock!);
    transaction.update(ref, { reservation: { ...current.reservation, status: "released" }, reservationCheckAt: FieldValue.delete(), reservationNote: "Unpaid hold expired after gateway reconciliation.", updatedAt: new Date().toISOString() });
  });
}

async function deferReservation(id: string, note: string) {
  await firebaseFirestore().runTransaction(async (transaction) => {
    const ref = collection().doc(id);
    const current = (await transaction.get(ref)).data() as TestOrder | undefined;
    if (!current || current.reservation?.status !== "held" || current.status === "paid" || current.status === "payment_review") return;
    transaction.update(ref, { reservationCheckAt: Date.now() + 60_000, reservationNote: note });
  });
}

/** Bounded scheduler worker. No TTL deletes, browser release flags or gateway calls in transactions. */
export async function reconcileTestReservations(limit = 5) {
  try {
    testCredentials();
    const count = Number.isSafeInteger(limit) ? Math.max(1, Math.min(5, limit)) : 5;
    const due = await collection().where("reservationCheckAt", "<=", Date.now()).orderBy("reservationCheckAt").limit(count).get();
    const outcomes = await Promise.allSettled(due.docs.map(async (document) => {
      const order = document.data() as TestOrder;
      try { await reconcileReservation(order); }
      catch { await deferReservation(order.id, "Payment status could not be confirmed. Stock remains held; retry reconciliation."); throw new Error("Reservation reconciliation unavailable."); }
    }));
    const failed = outcomes.filter((outcome) => outcome.status === "rejected").length;
    return { ok: failed === 0, checked: outcomes.length, failed };
  } catch {
    return { ok: false, checked: 0, failed: 0 };
  }
}
