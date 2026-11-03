import type { NextRequest } from "next/server";
import { checkoutSchema, createTestOrder } from "@/lib/payments/orders";
import { checkoutBody, checkoutFailure, checkoutGuard, checkoutJson } from "@/lib/payments/http";
import { requireCheckoutCustomer } from "@/lib/payments/customer-auth";

export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  const denied = await checkoutGuard(request, "checkout-create");
  if (denied) return denied;
  try {
    const input = checkoutSchema.safeParse(await checkoutBody(request));
    if (!input.success) return checkoutJson({ error: input.error.issues.some((issue) => issue.path[0] === "privacyConsent") ? "Please read the Privacy Policy and accept the checkout consent before continuing." : "Check your cart and delivery details and try again." }, 400);
    const customer = await requireCheckoutCustomer(request);
    return checkoutJson(await createTestOrder(input.data, customer));
  } catch (error) { return checkoutFailure(error); }
}
