import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

export class CheckoutError extends Error {
  constructor(message: string, public readonly status = 400) { super(message); }
}
export function testCheckoutConfigured() {
  return /^rzp_test_[a-zA-Z0-9]+$/.test(process.env.RAZORPAY_KEY_ID?.trim() ?? "") &&
    Boolean(process.env.RAZORPAY_KEY_SECRET?.trim() && process.env.RAZORPAY_WEBHOOK_SECRET?.trim() &&
      process.env.FIREBASE_PROJECT_ID?.trim() && process.env.FIREBASE_PROJECT_ID !== "your-firebase-project-id");
}
export function testCredentials() {
  if (!testCheckoutConfigured()) throw new CheckoutError("Razorpay test checkout is not configured. You can still send your cart to the team.", 503);
  return { key: process.env.RAZORPAY_KEY_ID!.trim(), secret: process.env.RAZORPAY_KEY_SECRET!.trim() };
}
export function validSignature(payload: string, signature: string, secret: string) {
  if (!/^[a-fA-F0-9]{64}$/.test(signature)) return false;
  const expected = createHmac("sha256", secret).update(payload).digest();
  return timingSafeEqual(expected, Buffer.from(signature, "hex"));
}

export const gatewayOrderSchema = z.object({ id: z.string().regex(/^order_[a-zA-Z0-9]+$/), amount: z.number().int(), currency: z.literal("INR"), receipt: z.string(), status: z.string() });
export const gatewayPaymentSchema = z.object({ id: z.string().regex(/^pay_[a-zA-Z0-9]+$/), order_id: z.string(), amount: z.number().int(), currency: z.string(), status: z.string(), amount_refunded: z.number().int().default(0) });

/** Server-only REST calls. Provider error bodies and credentials are never sent to clients. */
export async function razorpayRequest(path: string, body?: object): Promise<unknown> {
  const { key, secret } = testCredentials();
  try {
    const response = await fetch(`https://api.razorpay.com/v1/${path}`, {
      method: body ? "POST" : "GET", cache: "no-store", signal: AbortSignal.timeout(12000),
      headers: { Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`, "Content-Type": "application/json" },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (!response.ok) throw new Error("Gateway request failed");
    return await response.json();
  } catch { throw new CheckoutError("Razorpay could not be reached. Please try again shortly.", 502); }
}
