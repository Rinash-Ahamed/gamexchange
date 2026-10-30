import type { NextRequest } from "next/server";
import { verifySchema, verifyTestOrder } from "@/lib/payments/orders";
import { checkoutBody, checkoutFailure, checkoutGuard, checkoutJson } from "@/lib/payments/http";

export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  const denied = checkoutGuard(request, "checkout-verify", 30);
  if (denied) return denied;
  try {
    const input = verifySchema.safeParse(await checkoutBody(request));
    if (!input.success) return checkoutJson({ error: "Invalid payment verification." }, 400);
    return checkoutJson(await verifyTestOrder(input.data));
  } catch (error) { return checkoutFailure(error); }
}
