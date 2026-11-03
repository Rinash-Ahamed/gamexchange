"use client";

import Script from "next/script";
import { useRef, useState } from "react";
import { formatINR } from "@/data/products";
import type { CartItem } from "@/lib/cart";
import { customerClientAuth } from "@/lib/firebase/customer-client";
import { shippingSchema } from "@/lib/payments/shipping";
import { checkoutPrivacyConsentSchema, checkoutPrivacyNotice } from "@/lib/payments/privacy-consent";
import { useCustomer } from "./use-customer";
import { ShippingForm } from "./ShippingForm";

type PaymentResult = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type CheckoutOptions = { key: string; amount: number; currency: string; order_id: string; name: string; description: string; prefill: { name: string; email: string; contact: string }; theme: { color: string }; handler: (result: PaymentResult) => void; modal: { ondismiss: () => void } };
type CheckoutInstance = { open: () => void; on: (event: "payment.failed", handler: () => void) => void };
declare global { interface Window { Razorpay?: new (options: CheckoutOptions) => CheckoutInstance } }

async function post(path: string, body: object) {
  const user = customerClientAuth().currentUser;
  if (!user) throw new Error("Sign in with Google to continue.");
  const token = await user.getIdToken();
  const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body), signal: AbortSignal.timeout(25000) });
  const data = await response.json();
  if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : "Checkout could not be completed.");
  return data;
}

export function TestCheckout({ enabled, items, amount, disabled, onBusy, onSuccess }: {
  enabled: boolean; items: CartItem[]; amount: number; disabled: boolean;
  onBusy: (busy: boolean) => void; onSuccess: (reference: string, items: CartItem[]) => void;
}) {
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const customer = useCustomer();
  const shippingForm = useRef<HTMLFormElement>(null);
  const lock = useRef(false);
  const attempt = useRef<{ signature: string; requestId: string } | null>(null);
  const pending = useRef<{ requestId: string; result: PaymentResult; items: CartItem[] } | null>(null);
  const verifying = useRef(false);
  const setLocked = (value: boolean) => { lock.current = value; setBusy(value); onBusy(value); };

  async function verify() {
    const payment = pending.current;
    if (!payment || verifying.current) return;
    verifying.current = true;
    setLocked(true);
    setMessage("Verifying test payment. Please do not pay again.");
    try {
      const data = await post("/api/checkout/verify", { requestId: payment.requestId, ...payment.result });
      if (data.ok !== true || data.mode !== "test" || data.reference !== payment.requestId) throw new Error("Payment could not be confirmed. Do not pay again; contact the team.");
      pending.current = null;
      setNeedsVerification(false);
      attempt.current = null;
      onSuccess(data.reference, payment.items);
      setMessage("Test payment verified. No real money was collected and stock is unchanged.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Verification failed. Do not pay again."); }
    finally { verifying.current = false; setLocked(false); }
  }

  async function checkout() {
    if (lock.current || !enabled || !ready || !window.Razorpay || disabled || !customer.user) return;
    if (pending.current) { await verify(); return; }
    const form = shippingForm.current;
    if (!form?.reportValidity()) return;
    const privacyConsent = checkoutPrivacyConsentSchema.safeParse({ accepted: form.querySelector<HTMLInputElement>('[name="privacyConsent"]')?.checked === true, version: checkoutPrivacyNotice.version });
    if (!privacyConsent.success) { setMessage("Please read the Privacy Policy and accept the checkout consent before continuing."); return; }
    const shipping = shippingSchema.safeParse(Object.fromEntries(new FormData(form)));
    if (!shipping.success) { setMessage(shipping.error.issues[0]?.message ?? "Check your delivery details."); return; }
    setLocked(true);
    setMessage("Preparing secure test checkout...");
    const signature = JSON.stringify({ items, amount, uid: customer.user.uid, shipping: shipping.data, privacyConsent: privacyConsent.data });
    if (attempt.current?.signature !== signature) attempt.current = { signature, requestId: crypto.randomUUID() };
    const requestId = attempt.current.requestId;
    const purchased = items.map((item) => ({ ...item }));
    try {
      const order = await post("/api/checkout/order", { requestId, items: purchased, expectedAmount: amount, shipping: shipping.data, privacyConsent: privacyConsent.data });
      if (order.mode !== "test" || !/^rzp_test_/.test(order.key) || order.amount !== amount || order.currency !== "INR") throw new Error("Checkout could not be verified. Please try again.");
      const checkout = new window.Razorpay({
        key: order.key, amount: order.amount, currency: order.currency, order_id: order.orderId,
        name: "GameXchange", description: "Test order only. No delivery or stock reservation.", theme: { color: "#3a69f5" },
        prefill: { name: shipping.data.name, email: customer.user.email ?? "", contact: `+91${shipping.data.phone}` },
        handler(result) { pending.current = { requestId, result, items: purchased }; setNeedsVerification(true); void verify(); },
        modal: { ondismiss() { if (!verifying.current && !pending.current) { setLocked(false); setMessage("Checkout closed. Your cart is unchanged."); } } },
      });
      checkout.on("payment.failed", () => { setMessage("Test payment failed. You can retry in checkout or close it. Your cart is unchanged."); });
      checkout.open();
      setMessage("Complete the test payment in Razorpay. Use test details only.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to open checkout."); setLocked(false); }
  }

  return <div className="mt-5 border-t border-line pt-5">
    <h3 className="font-display text-base font-semibold">Account &amp; delivery</h3>
    {!customer.ready ? <p role="status" className="mt-3 text-sm text-muted">Checking sign-in...</p> : customer.user ? <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm"><span className="min-w-0 break-all">{customer.user.email}</span><button type="button" disabled={busy || needsVerification || customer.busy} onClick={() => void customer.logout()} className="min-h-11 text-accent-text underline disabled:opacity-50">Sign out</button></div> : <p className="mt-3 text-sm leading-6 text-muted">Proceed to sign in securely with Google, then enter your delivery details before payment.</p>}
    {customer.error && <p role="alert" className="mt-2 text-sm text-danger">{customer.error}</p>}
    {customer.user && <ShippingForm key={customer.user.uid} formRef={shippingForm} disabled={busy || needsVerification} />}
    {enabled && <Script id="razorpay-checkout" src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" onReady={() => setReady(true)} onError={() => { setReady(false); setMessage("Razorpay could not load. Check your connection and refresh to try again."); }} />}
    <p className="text-xs leading-5 text-muted">{enabled ? "Test checkout only. No real payment or delivery. Use test contact details." : "Online payments are temporarily unavailable. Your cart is saved; please try again later."}</p>
    <button type="button" disabled={!customer.ready || !customer.available || customer.busy || busy || (disabled && !needsVerification) || Boolean(customer.user && (!enabled || !ready))} onClick={() => !customer.user ? void customer.login() : needsVerification ? void verify() : void checkout()} className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-gradient-to-br from-fill to-fill-2 px-4 font-display text-sm font-semibold text-accent-ink disabled:cursor-not-allowed disabled:opacity-60">
      {!customer.ready ? "Please wait..." : !customer.available ? "Sign-in unavailable" : customer.busy ? "Signing in..." : !customer.user ? "Proceed to payment" : !enabled ? "Payment unavailable" : busy ? "Please wait..." : needsVerification ? "Retry payment verification" : !ready ? "Loading Razorpay..." : `Pay with Razorpay ${formatINR(amount / 100)} (Test)`}
    </button>
    {message && <p role="status" className="mt-3 break-words text-sm leading-6">{message}</p>}
  </div>;
}
