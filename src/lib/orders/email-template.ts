import type { TestOrder } from "@/lib/payments/orders";
import type { Shipment } from "./tracking";

export type OrderEmailKind = "confirmation" | "admin" | "shipment";
const entities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const escape = (value: string | number) => String(value).replace(/[&<>"']/g, (character) => entities[character]!);
const money = (amount: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount / 100);

export function orderEmailTemplate(order: TestOrder, kind: OrderEmailKind, shipment?: Shipment) {
  const heading = kind === "shipment" ? "Your parcel is on its way" : kind === "admin" ? "New verified order" : "Thank you for your order";
  const date = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(new Date(order.paidAt ?? order.createdAt));
  const shipping = order.shipping;
  const lines = ["TEST ORDER: No real payment or shipment. Do not fulfil.", heading, `Order ID: ${order.id}`, `Order date: ${date} IST`, "Payment status: Captured (test)", `Payment ID: ${order.paymentId ?? "Not available"}`, `Razorpay order: ${order.razorpayOrderId ?? "Not available"}`, ...order.items.map((item) => `${item.name} x ${item.quantity}: ${money(item.quantity * item.unitAmount)}`), `Total: ${money(order.amount)}`, `Customer: ${shipping?.name ?? "Not available"}`, `Email: ${order.customer?.email ?? "Not available"}`, `Phone: ${shipping?.phone ?? "Not available"}`, `Delivery address: ${shipping ? [shipping.addressLine1, shipping.addressLine2, shipping.city, shipping.state, shipping.postalCode, "India"].filter(Boolean).join(", ") : "Not available"}`];
  if (kind === "shipment") lines.push("Shipping confirmation: Parcel Sent (simulation).", `Carrier: ${shipment?.carrier || "Not provided"}`, `Tracking number: ${shipment?.trackingNumber || "Not provided"}`, `Tracking link: ${shipment?.trackingUrl || "Not provided"}`);
  const text = [...lines, "GameXchange | Thank you for choosing us."].join("\n\n");
  const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta charset="utf-8"></head><body style="margin:0;background:#080b16;color:#eef2ff;font-family:Arial,sans-serif"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="100%" style="max-width:600px;background:#111626;border:1px solid #30394d;border-radius:16px" cellspacing="0" cellpadding="0"><tr><td style="padding:24px;border-bottom:3px solid #7056ff"><img src="cid:gamexchange-logo" width="150" alt="GameXchange" style="display:block;max-width:100%;height:auto"><h1 style="font-size:24px;margin:24px 0 0">${escape(heading)}</h1></td></tr><tr><td style="padding:24px;overflow-wrap:anywhere">${lines.map((line, index) => `<p style="margin:0 0 16px;line-height:1.6;${index === 0 ? "color:#ffcb80;font-weight:bold;" : ""}">${escape(line)}</p>`).join("")}</td></tr><tr><td style="padding:24px;color:#b6bfd9;border-top:1px solid #30394d;font-size:12px">GameXchange<br>Thank you for choosing us. Keep this email for your records.</td></tr></table></td></tr></table></body></html>`;
  return { subject: `[GameXchange TEST] ${heading} | ${order.id}`, text, html };
}
