import type { TestOrder } from "@/lib/payments/orders";
import { formatAdminDate } from "@/lib/admin/format";

export function OrderDeliveryDetails({ order }: { order: TestOrder }) {
  return <>
    {order.customer && <p className="mt-4 break-all text-sm"><span className="text-muted">Customer email: </span>{order.customer.email}</p>}
    {order.shipping ? <section className="mt-4 rounded-xl border border-line p-3 text-sm" aria-label="Delivery details">
      <h2 className="font-semibold">Delivery details</h2>
      <address className="mt-2 break-words not-italic leading-6">
        {order.shipping.name}<br />{order.shipping.addressLine1}<br />
        {order.shipping.addressLine2 && <>{order.shipping.addressLine2}<br /></>}
        {order.shipping.city}, {order.shipping.state} {order.shipping.postalCode}<br />India
      </address>
      <p className="mt-2">Mobile: {order.shipping.phone}</p>
    </section> : <p className="mt-4 text-xs text-muted">No delivery details were collected for this older test order.</p>}
    {order.privacyConsent && <p className="mt-3 text-xs leading-5 text-muted">Checkout privacy consent recorded: {formatAdminDate(order.privacyConsent.acceptedAt)}. Notice version: {order.privacyConsent.version}.</p>}
  </>;
}
