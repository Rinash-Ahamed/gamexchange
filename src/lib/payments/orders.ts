import "server-only";

import { createHash } from "node:crypto";
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

export const checkoutSchema = z.object({
  requestId: z.uuid(),
  items: z.array(z.object({ id: z.string().regex(/^[a-zA-Z0-9-]{1,128}$/), quantity: z.number().int().min(1).max(99) })).min(1).max(30),
  expectedAmount: z.number().int().positive().max(100_000_000),
  shipping: shippingSchema,
  privacyConsent: checkoutPrivacyConsentSchema,
}).refine((value) => new Set(value.items.map((item) => item.id)).size === value.items.length, "Duplicate products are not allowed.");
export const verifySchema = z.object({ requestId: z.uuid(), razorpay_order_id: z.string().regex(/^order_[a-zA-Z0-9]+$/), razorpay_payment_id: z.string().regex(/^pay_[a-zA-Z0-9]+$/), razorpay_signature: z.string().regex(/^[a-fA-F0-9]{64}$/) });
export type TestOrder = OrderTracking & {
  id: string; mode: "test"; keyId: string; fingerprint: string; status: "creating" | "created" | "paid";
  amount: number; currency: "INR"; items: { id: string; name: string; quantity: number; unitAmount: number }[];
  createdAt: string; updatedAt: string; razorpayOrderId?: string; paymentId?: string;
  customer?: CheckoutCustomer; shipping?: ShippingAddress;
  privacyConsent?: { accepted: true; version: string; acceptedAt: string };
};
const collection = () => firebaseFirestore().collection("checkoutTestOrders");
const fingerprint = (input: z.infer<typeof checkoutSchema>, customer: CheckoutCustomer) => createHash("sha256").update(JSON.stringify({ uid: customer.uid, shipping: input.shipping, privacyConsent: input.privacyConsent, amount: input.expectedAmount, items: [...input.items].sort((a, b) => a.id.localeCompare(b.id)) })).digest("hex");
function checkoutResponse(order: TestOrder) {
  if (order.status === "paid") throw new CheckoutError("This test order is already paid. Check your order reference.", 409);
  if (!order.razorpayOrderId) throw new CheckoutError("This checkout is still being prepared. Please retry shortly.", 409);
  return { requestId: order.id, key: order.keyId, orderId: order.razorpayOrderId, amount: order.amount, currency: order.currency, mode: "test" as const };
}

export async function createTestOrder(input: z.infer<typeof checkoutSchema>, customer: CheckoutCustomer) {
  const credentials = testCredentials();
  const ref = collection().doc(input.requestId);
  const hash = fingerprint(input, customer);
  const existing = await ref.get();
  if (existing.exists) {
    const order = existing.data() as TestOrder;
    if (order.customer?.uid !== customer.uid || order.fingerprint !== hash || order.keyId !== credentials.key) throw new CheckoutError("Checkout details changed. Start a new checkout.", 409);
  }
  // Read current inventory directly, never client prices or the public cache. No demo seeding.
  const db = firebaseFirestore();
  const documents = await db.getAll(...input.items.map((item) => db.collection("inventory").doc(item.id)));
  const items = input.items.map((line, index) => {
    const product = documents[index]?.data() as InventoryItem | undefined;
    if (!product || product.status !== "active" || !Number.isInteger(product.stock) || product.stock < line.quantity || isPcComponentCategory(product.category)) {
      throw new CheckoutError("Some items are no longer available in the requested quantity. Refresh your cart.", 409);
    }
    if (!Number.isSafeInteger(product.price) || product.price <= 0) throw new CheckoutError("One item needs a price confirmation. Contact the team.", 409);
    return { id: line.id, name: product.name, quantity: line.quantity, unitAmount: product.price * 100 };
  });
  const amount = items.reduce((sum, item) => sum + item.unitAmount * item.quantity, 0);
  if (!Number.isSafeInteger(amount) || amount !== input.expectedAmount) throw new CheckoutError("Prices changed. Refresh your cart before continuing.", 409);
  if (existing.exists) {
    const order = existing.data() as TestOrder;
    if (order.amount !== amount) throw new CheckoutError("Prices changed. Start a new checkout.", 409);
    return checkoutResponse(order);
  }
  const now = new Date().toISOString();
  const order: TestOrder = { id: input.requestId, mode: "test", keyId: credentials.key, fingerprint: hash, status: "creating", amount, currency: "INR", items, customer, shipping: input.shipping, privacyConsent: { ...input.privacyConsent, acceptedAt: now }, createdAt: now, updatedAt: now };
  const claimed = await db.runTransaction(async (transaction) => {
    if ((await transaction.get(ref)).exists) return false;
    transaction.create(ref, order);
    return true;
  });
  if (!claimed) throw new CheckoutError("Checkout is already being prepared. Retry shortly.", 409);
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
  await firebaseFirestore().runTransaction(async (transaction) => {
    const ref = collection().doc(order.id);
    const current = (await transaction.get(ref)).data() as TestOrder | undefined;
    if (!current || current.razorpayOrderId !== payment.order_id || current.amount !== payment.amount) throw new CheckoutError("Test order could not be verified.", 409);
    if (current.status === "paid") {
      if (current.paymentId !== paymentId) throw new CheckoutError("This order has a different payment.", 409);
      return;
    }
    const now = new Date().toISOString();
    transaction.update(ref, { status: "paid", paymentId, paidAt: now, fulfillmentStatus: "Order Placed", history: [{ status: "Order Placed", at: now, actor: "payment-verification" }], updatedAt: now });
    const paid: TestOrder = { ...current, status: "paid", paymentId, paidAt: now };
    enqueueOrderEmail(transaction, paid, "confirmation");
    enqueueOrderEmail(transaction, paid, "admin");
    // Sandbox orders deliberately do not reserve or decrement real inventory.
  });
  after(() => dispatchOrderEmails(order.id));
  return { ok: true, mode: "test", reference: order.id };
}

export async function verifyTestOrder(input: z.infer<typeof verifySchema>, customer: CheckoutCustomer) {
  const { secret } = testCredentials();
  const order = (await collection().doc(input.requestId).get()).data() as TestOrder | undefined;
  if (order?.customer?.uid !== customer.uid || !order?.razorpayOrderId || order.razorpayOrderId !== input.razorpay_order_id ||
    !validSignature(`${order.razorpayOrderId}|${input.razorpay_payment_id}`, input.razorpay_signature, secret)) throw new CheckoutError("Payment signature could not be verified.", 400);
  return confirmCaptured(order, input.razorpay_payment_id);
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
