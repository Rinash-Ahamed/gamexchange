import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { listTestOrders } from "@/lib/payments/orders";
import { formatAdminDate } from "@/lib/admin/format";
import { formatINR } from "@/data/products";

export const metadata: Metadata = { title: "Test orders", robots: { index: false, follow: false } };
export default async function TestOrdersPage() {
  await requireAdmin();
  const orders = await listTestOrders();
  return <div className="mx-auto max-w-5xl"><h1 className="font-display text-2xl font-bold uppercase">Test orders</h1><p className="mt-2 text-sm leading-6 text-muted">Latest 50 Razorpay sandbox orders only. These are not customer sales and must not be fulfilled. No stock is reserved or deducted.</p>
    <div className="mt-6 space-y-3">{orders.length ? orders.map((order) => <details key={order.id} className="rounded-xl border border-line-strong bg-surface p-4"><summary className="cursor-pointer text-sm"><span className="font-semibold">{order.status === "paid" ? "Test payment verified" : order.status === "creating" ? "Preparing / needs review" : "Awaiting test payment"}</span><span className="ml-3 font-display">{formatINR(order.amount / 100)}</span><span className="mt-1 block text-xs text-muted">{formatAdminDate(order.createdAt)}</span></summary><dl className="mt-4 space-y-2 break-all text-xs"><div><dt className="text-muted">Reference</dt><dd>{order.id}</dd></div>{order.razorpayOrderId && <div><dt className="text-muted">Razorpay order</dt><dd>{order.razorpayOrderId}</dd></div>}{order.paymentId && <div><dt className="text-muted">Payment</dt><dd>{order.paymentId}</dd></div>}</dl><ul className="mt-3 space-y-1 text-sm">{order.items.map((item) => <li key={item.id}>{item.quantity} x {item.name}: {formatINR(item.unitAmount * item.quantity / 100)}</li>)}</ul></details>) : <p className="text-sm text-muted">No test orders yet.</p>}</div>
  </div>;
}
