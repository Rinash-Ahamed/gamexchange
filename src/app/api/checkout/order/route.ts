import type { NextRequest } from "next/server";
import { checkoutSchema, createTestOrder } from "@/lib/payments/orders";
import { checkoutBody, checkoutFailure, checkoutGuard, checkoutJson } from "@/lib/payments/http";

export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  const denied = checkoutGuard(request, "checkout-create");
  if (denied) return denied;
  try {
    const input = checkoutSchema.safeParse(await checkoutBody(request));
    if (!input.success) return checkoutJson({ error: "Check your cart and try again." }, 400);
    return checkoutJson(await createTestOrder(input.data));
  } catch (error) { return checkoutFailure(error); }
}
