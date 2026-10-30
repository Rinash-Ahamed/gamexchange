"use client";

import Script from "next/script";
import { useRef, useState } from "react";
import { formatINR } from "@/data/products";
import type { CartItem } from "@/lib/cart";

type PaymentResult = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type CheckoutOptions = { key: string; amount: number; currency: string; order_id: string; name: string; description: string; theme: { color: string }; handler: (result: PaymentResult) => void; modal: { ondismiss: () => void } };
type CheckoutInstance = { open: () => void; on: (event: "payment.failed", handler: () => void) => void };
declare global { interface Window { Razorpay?: new (options: CheckoutOptions) => CheckoutInstance } }

async function post(path: string, body: object) {
  const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(25000) });
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
    if (lock.current || !ready || !window.Razorpay || disabled) return;
    if (pending.current) { await verify(); return; }
    setLocked(true);
    setMessage("Preparing secure test checkout...");
    const signature = JSON.stringify({ items, amount });
    if (attempt.current?.signature !== signature) attempt.current = { signature, requestId: crypto.randomUUID() };
    const requestId = attempt.current.requestId;
    const purchased = items.map((item) => ({ ...item }));
    try {
      const order = await post("/api/checkout/order", { requestId, items: purchased, expectedAmount: amount });
      if (order.mode !== "test" || !/^rzp_test_/.test(order.key) || order.amount !== amount || order.currency !== "INR") throw new Error("Test checkout configuration did not match.");
      const checkout = new window.Razorpay({
        key: order.key, amount: order.amount, currency: order.currency, order_id: order.orderId,
        name: "GamexChange", description: "Test order only. No delivery or stock reservation.", theme: { color: "#3a69f5" },
        handler(result) { pending.current = { requestId, result, items: purchased }; setNeedsVerification(true); void verify(); },
        modal: { ondismiss() { if (!verifying.current && !pending.current) { setLocked(false); setMessage("Checkout closed. Your cart is unchanged."); } } },
      });
      checkout.on("payment.failed", () => { setMessage("Test payment failed. You can retry in checkout or close it. Your cart is unchanged."); });
      checkout.open();
      setMessage("Complete the test payment in Razorpay. Use test details only.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to open checkout."); setLocked(false); }
  }

  return <div className="mt-5 border-t border-line pt-5">
    {enabled && <Script id="razorpay-checkout" src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" onReady={() => setReady(true)} onError={() => { setReady(false); setMessage("Razorpay could not load. Check your connection or send your cart to the team."); }} />}
    <p className="text-xs leading-5 text-muted">{enabled ? "Test checkout only. No real payment, delivery or stock reservation. Use dummy contact details in Razorpay." : "Online payments are not configured yet. Send the full cart to our team on WhatsApp."}</p>
    {enabled && <button type="button" disabled={busy || !ready || (disabled && !needsVerification)} onClick={() => needsVerification ? void verify() : void checkout()} className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-gradient-to-br from-fill to-fill-2 px-4 font-display text-sm font-semibold text-accent-ink disabled:cursor-not-allowed disabled:opacity-60">
      {busy ? "Please wait..." : needsVerification ? "Retry payment verification" : !ready ? "Loading Razorpay..." : `Test checkout ${formatINR(amount / 100)}`}
    </button>}
    {message && <p role="status" className="mt-3 break-words text-sm leading-6">{message}</p>}
  </div>;
}
