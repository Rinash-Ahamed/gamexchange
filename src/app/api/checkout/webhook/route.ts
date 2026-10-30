import type { NextRequest } from "next/server";
import { z } from "zod";
import { readLimitedText, RequestBodyError } from "@/lib/request-body";
import { checkoutFailure, checkoutJson } from "@/lib/payments/http";
import { testCheckoutConfigured, validSignature } from "@/lib/payments/razorpay";
import { reconcileTestPayment } from "@/lib/payments/orders";

export const runtime = "nodejs";
const eventSchema = z.object({ event: z.string(), payload: z.object({ payment: z.object({ entity: z.object({ id: z.string().regex(/^pay_[a-zA-Z0-9]+$/), order_id: z.string().regex(/^order_[a-zA-Z0-9]+$/) }) }).optional() }) });
export async function POST(request: NextRequest) {
  if (!testCheckoutConfigured()) return checkoutJson({ error: "Test checkout is not configured." }, 503);
  const signature = request.headers.get("x-razorpay-signature") ?? "";
  if (!/^[a-fA-F0-9]{64}$/.test(signature)) return checkoutJson({ error: "Invalid webhook signature." }, 400);
  try {
    const raw = await readLimitedText(request, 128000);
    if (!validSignature(raw, signature, process.env.RAZORPAY_WEBHOOK_SECRET!.trim())) return checkoutJson({ error: "Invalid webhook signature." }, 400);
    const event = eventSchema.safeParse(JSON.parse(raw));
    if (!event.success) return checkoutJson({ error: "Invalid event." }, 400);
    if (["payment.captured", "order.paid"].includes(event.data.event)) {
      const payment = event.data.payload.payment?.entity;
      if (!payment) return checkoutJson({ error: "Missing payment." }, 400);
      await reconcileTestPayment(payment.id, payment.order_id);
    }
    return checkoutJson({ ok: true });
  } catch (error) {
    if (error instanceof RequestBodyError) return checkoutJson({ error: error.message }, error.status);
    return checkoutFailure(error);
  }
}
