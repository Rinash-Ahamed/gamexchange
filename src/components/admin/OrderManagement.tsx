import type { TestOrder } from "@/lib/payments/orders";
import { listOrderEmails } from "@/lib/orders/outbox";
import { nextOrderStage } from "@/lib/orders/tracking";
import { canRetryEmail } from "@/lib/orders/notification-policy";
import { formatAdminDate } from "@/lib/admin/format";
import { changeOrderStatus, retryEmail } from "@/app/admin/(protected)/orders/actions";
import { ConfirmSubmit } from "./ConfirmSubmit";
import { adminButtonClass, adminInputClass, adminLabelClass } from "./styles";

export async function OrderManagement({ order }: { order: TestOrder }) {
  const emails = await listOrderEmails(order.id);
  const stage = order.fulfillmentStatus ?? "Order Placed";
  const next = nextOrderStage(stage);
  return <section className="mt-5 space-y-5 border-t border-line pt-5">
    <h2 className="font-display text-lg">Order tracking: {stage}</h2>
    <ol className="space-y-2 text-xs text-muted">{(order.history ?? [{ status: "Order Placed", at: order.paidAt ?? order.updatedAt, actor: "payment-verification" }]).map((event) => <li key={event.status}><span className="font-semibold text-ink">{event.status}</span> · {formatAdminDate(event.at)} · {event.actor === "payment-verification" ? "Payment verification" : "Admin"}</li>)}</ol>
    {order.shipment && <p className="break-words text-sm">Carrier: {order.shipment.carrier || "Not provided"}<br />Tracking: {order.shipment.trackingNumber || "Not provided"}<br />{order.shipment.trackingUrl}</p>}
    {next && <ConfirmSubmit submitAction={changeOrderStatus} title={`Mark as ${next}?`} message={next === "Parcel Sent" ? "This is a simulated shipment. A TEST shipping email will be queued once for the customer." : "Update this test order's internal tracking history."} intent="primary" confirmLabel="Update status" cancelLabel="Keep status" className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="orderId" value={order.id} /><input type="hidden" name="previous" value={stage} /><input type="hidden" name="status" value={next} />
      {next === "Parcel Sent" && <>{([ ["carrier", "Courier (optional)"], ["trackingNumber", "Tracking number (optional)"], ["trackingUrl", "HTTPS tracking link (optional)"] ] as const).map(([name, label]) => <label key={name} className="min-w-0"><span className={adminLabelClass}>{label}</span><input className={adminInputClass} name={name} type={name === "trackingUrl" ? "url" : "text"} maxLength={name === "trackingUrl" ? 1000 : 150} /></label>)}</>}
      <button className={`${adminButtonClass} justify-self-start`} type="submit">Mark {next}</button>
    </ConfirmSubmit>}
    <div><h3 className="font-semibold">Email notifications</h3><p className="mt-1 text-xs text-muted">Sent means accepted by Gmail, not guaranteed inbox delivery. Refresh to see background results.</p>
      {emails.length ? <ul className="mt-3 space-y-3">{emails.map((email) => <li key={email.id} className="rounded-lg border border-line p-3 text-xs"><p className="font-semibold capitalize">{email.kind === "admin" ? "Business notification" : email.kind === "shipment" ? "Shipping confirmation" : "Order confirmation"}: {email.status}</p><p className="mt-1 break-all text-muted">{email.recipient || "Recipient not configured"} · Attempts: {email.attempts} · {formatAdminDate(email.updatedAt)}</p><p className="mt-1 text-muted">{email.note}</p>{canRetryEmail(email.status) && <div className="mt-2"><ConfirmSubmit submitAction={retryEmail} title="Retry notification?" message="Retry this unsent email. Already sent or uncertain notifications cannot be resent here." intent="primary" confirmLabel="Retry email" cancelLabel="Cancel"><input type="hidden" name="orderId" value={order.id} /><input type="hidden" name="kind" value={email.kind} /><button type="submit" className={adminButtonClass}>Retry email</button></ConfirmSubmit></div>}</li>)}</ul> : <p className="mt-2 text-xs text-muted">This older order has no recorded email jobs. Historical confirmations are not sent automatically.</p>}
    </div>
  </section>;
}
