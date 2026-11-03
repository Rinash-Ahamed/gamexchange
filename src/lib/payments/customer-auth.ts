import "server-only";

import type { NextRequest } from "next/server";
import { firebaseAdminAuth } from "@/lib/firebase/admin";
import { CheckoutError } from "./razorpay";
import type { CheckoutCustomer } from "./shipping";

export async function requireCheckoutCustomer(request: NextRequest): Promise<CheckoutCustomer> {
  const authorization = request.headers.get("authorization") ?? "";
  if (!authorization.startsWith("Bearer ") || authorization.length > 8192) throw new CheckoutError("Sign in with Google to continue.", 401);
  try {
    const token = await firebaseAdminAuth().verifyIdToken(authorization.slice(7), true);
    if (!token.email || !token.email_verified || token.firebase.sign_in_provider !== "google.com") throw new Error("Invalid shopper identity");
    return { uid: token.uid, email: token.email };
  } catch {
    throw new CheckoutError("Your sign-in could not be verified. Sign in with Google again.", 401);
  }
}
