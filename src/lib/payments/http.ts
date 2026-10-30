import "server-only";

import { NextResponse, type NextRequest } from "next/server";
import { clientKey, isSameOrigin } from "@/lib/security";
import { rateLimit } from "@/lib/rate-limit";
import { readLimitedText, RequestBodyError } from "@/lib/request-body";
import { CheckoutError } from "./razorpay";

export const checkoutJson = (body: object, status = 200, headers: Record<string, string> = {}) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
export function checkoutGuard(request: NextRequest, name: string, max = 12) {
  if (!isSameOrigin(request)) return checkoutJson({ error: "Request not allowed." }, 403);
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return checkoutJson({ error: "Use JSON for checkout." }, 415);
  const limit = rateLimit(`${name}:${clientKey(request)}`, max, 10 * 60 * 1000);
  if (!limit.ok) return checkoutJson({ error: "Too many checkout attempts. Please wait and try again." }, 429, { "Retry-After": String(limit.retryAfter) });
}
export async function checkoutBody(request: NextRequest) {
  try { return JSON.parse(await readLimitedText(request, 16000)) as unknown; }
  catch (error) {
    if (error instanceof RequestBodyError) throw new CheckoutError(error.message, error.status);
    throw new CheckoutError("Invalid checkout request.");
  }
}
export function checkoutFailure(error: unknown) {
  return checkoutJson({ error: error instanceof CheckoutError ? error.message : "Checkout is temporarily unavailable. Please try again or contact the team." }, error instanceof CheckoutError ? error.status : 503);
}
