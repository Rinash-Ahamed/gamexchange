# Cart and Razorpay test checkout

## Implemented

- Stock reservation follow-up, 5 November 2026: new checkout transactions hold isolated test stock for ten minutes and captured-payment transactions consume it once with a permanent payment-ID claim. Expiry requires gateway reconciliation through the separate protected reservation worker; configure its every-minute scheduler before expecting automatic release. Very late captures without remaining capacity become payment review, not fulfilment. Actual inventory stays unchanged and live keys remain rejected. Historical pending orders without holds require review if captured. See [stock reservation details and verification limits](STOCK_RESERVATIONS.md). This supersedes statements below that a sandbox quote has no reservation; it is still not a real-stock reservation.

- Customer checkout now requires server-verified Google sign-in and validated Indian delivery details. Customer UID/email and recipient name, phone and address are saved with each new sandbox order and visible under protected Admin > Test orders. Customer verification is owner-bound; webhook verification is unchanged. Enable Firebase Google Authentication and authorized domains as described in FIREBASE_SETUP.md. Use sample shipping details for sandbox tests. This is not courier integration, delivery coverage validation, shipping pricing or live payment activation.

- Add to cart on the shop grid and both homepage shelf presentations. A navigation cart icon shows quantity on desktop and mobile. The themed `/cart` page supports multiple products, stock-aware quantity controls, removal, unavailable-item warnings and one combined WhatsApp enquiry.
- Browser storage contains only product IDs and quantities, capped at 30 different products and 99 units per line. It is untrusted convenience state, not an authoritative price, reservation or order. Storage-disabled visitors retain an in-memory cart. Cart rendering uses hydration-safe external-store subscriptions and cross-tab updates.
- Test checkout re-reads current inventory directly from Firestore without public cache/demo initialization. It validates availability, stock quantities, positive whole-rupee prices and the expected INR subtotal. Amounts sent to Razorpay use integer paise. Changed prices/stock require refreshing the cart.
- The server creates the Razorpay order and retains a product/price snapshot in `checkoutTestOrders`. Request UUIDs provide duplicate-create protection. Successful client callbacks require HMAC signature verification using the stored gateway order ID, plus an authenticated gateway fetch checking payment ID, amount, currency, order association, captured status and no refunds. No client success flag is trusted.
- Signed `payment.captured` and `order.paid` webhooks reconcile missed callbacks. Signatures are checked against the original request text before JSON parsing. Reconciliation re-fetches gateway status; transactions make duplicate callback/webhook delivery idempotent and do not regress paid status on failed attempts.
- Admin > Test orders shows the latest 50 sandbox records under the same MFA session. Manage order and emails supports simulated forward tracking, optional tracking details, history and email status/retries. It explicitly prohibits real fulfilment. New verified paid transitions queue Gmail customer/business confirmations; Parcel Sent queues one clearly labelled TEST shipping confirmation. Configure SMTP and the scheduled retry worker in EMAIL_SETUP.md. No email delivery has been verified yet.
- Sandbox orders do not reserve or decrement real inventory, collect real money, create shipments or represent real customer sales. Live keys are rejected, not silently accepted. There is no live-payment switch in this implementation.

## Configuration

### Webhook URL and active events

Use `https://gamexchange.co.in/api/checkout/webhook` if that domain serves this deployed application. Otherwise use the actual deployed HTTPS hostname followed by `/api/checkout/webhook`. This is a POST endpoint; opening it in a browser is not a webhook test. The endpoint exists in source, but its deployment and public reachability have not been verified in this update.

In Razorpay Test Mode, open Accounts & Settings > Webhooks and add this endpoint. Enable exactly these active events for the current integration:

| Event | Existing handling |
| --- | --- |
| `payment.captured` | Re-fetch and validate the captured payment, then transactionally mark the matching test order paid. |
| `order.paid` | Reconcile the associated captured payment if the browser callback was missed. |

Set a separate strong webhook secret in the Razorpay form and put the identical value in `RAZORPAY_WEBHOOK_SECRET` on the deployment. Do not use the API key secret as the webhook secret. Redeploy after changing hosting environment values. Add an alert email in Razorpay so delivery failures are visible to the operator.

Do not select all events. `payment.authorized`, `payment.failed`, refund, settlement and subscription events do not currently update stored order state. Authorization alone is not proof of capture, and failed attempts must not overwrite a successful payment. Refund/fulfilment workflows and real-money payments require a separate implementation.

Validate with a sandbox purchase and inspect both Razorpay delivery logs and Admin > Test orders. Repeat delivery must not create another order or reduce stock. A successful build or a browser GET does not verify webhook delivery. This update did not create provider settings, deploy an endpoint, send a webhook or perform a payment.

References checked on 2026-11-03: [Razorpay webhook signature and retry validation](https://razorpay.com/docs/webhooks/validate-test/) and [payment capture and dashboard webhook setup](https://razorpay.com/docs/payments/payments/dashboard/).

Use a Razorpay account's **Test Mode** API keys. Add these to `.env.local` and the staging host environment:

```dotenv
RAZORPAY_KEY_ID=rzp_test_your_test_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
RAZORPAY_WEBHOOK_SECRET=your_independent_webhook_secret
```

The webhook secret is an independent secret chosen in Razorpay's webhook setup, not the API key secret. All environment names are server-only. Only the test key ID and public order fields are returned to the checkout browser. Never paste secrets into chat or commit `.env.local`.

Firebase server credentials must also be configured. No new Firebase client rules, indexes, SDK dependency or public write permissions are required. The Admin SDK writes test records. Existing inventory and service records are not migrated or deleted.

Restart the app after changing environment values. Without valid test configuration, the cart remains usable and offers the combined WhatsApp enquiry. The Razorpay checkout script is loaded only on the configured cart page, not the hero or other routes.

In Razorpay Test Mode:

1. Set automatic payment capture for the integration. An authorized payment is not treated as paid by this app; capture it in the test dashboard if required, then retry verification.
2. Configure a webhook at `https://YOUR-STAGING-HOST/api/checkout/webhook`, with the same RAZORPAY_WEBHOOK_SECRET.
3. Subscribe to `payment.captured` and `order.paid`. A webhook needs a reachable public endpoint, not a plain localhost URL. No tunnel, provider setting or deployment has been created automatically.
4. Add real configured stock to the cart, use Razorpay test payment/contact details, and inspect Admin > Test orders. Do not use real card/contact data for simulation.
5. Test dismissal, failed payment and retry, duplicate callbacks, webhook replay, browser closure, mismatched amounts/signatures and delayed capture. Compare the resulting references with the Razorpay Test dashboard.

## Recovery and limits

- A pending verification keeps the cart and offers verification retry, not another payment. If the browser closes, webhooks can still mark the saved test record paid; the cart is not automatically cleared in that closed browser. Retain the Razorpay reference and check Test orders rather than paying again.
- Verification retry state is memory-only; it does not survive a full refresh. There is not yet a customer order-history/status page. Webhook reconciliation and the admin screen are the recovery path for sandbox tests.
- An uncertain gateway order creation remains `creating` for inspection rather than automatically issuing duplicate gateway orders. This status alone is never proof of payment. Manual gateway reconciliation of uncertain creates is not automated.
- The cart itself persists independently; local price displays may be stale until refresh, but the server rejects mismatched checkout totals. The order holds isolated test capacity, not actual inventory. Browser cart contents alone are not a hold. See STOCK_RESERVATIONS.md before testing expiry or late payments.
- The existing limiter/replay/proxy limitations documented in `ARCHITECTURE_REVIEW.md` still apply. Abuse controls are not yet distributed. No automatic retention cleanup is installed for sandbox order records.

## Before any live-payment implementation

Agree stock reservation/expiry/refund behavior, shipping versus collection and fees, tax/invoice rules, customer identity/order access, live fulfilment/admin workflows, immutable audit history and operational reconciliation. Add durable retry/recovery and stock concurrency tests. Approve privacy/terms wording for payment-provider data handling. Validate backups, production webhook delivery and shared abuse protection. Then implement live credentials as an explicit separate feature; merely replacing test keys is intentionally insufficient.

## Verification

Postbuild API smoke checks now include four checkout guard checks, for 12 total. These deliberately avoid provider calls, valid payments and Firebase mutations. Build/lint and real end-to-end sandbox results must be recorded separately in SESSION.md. No successful Razorpay payment or live provider configuration is claimed by this document.

## Official references reviewed

- [Standard Checkout integration](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/)
- [Create an order](https://razorpay.com/docs/api/orders/create/)
- [Fetch a payment](https://razorpay.com/docs/api/payments/fetch-with-id/)
- [Validate and test webhooks](https://razorpay.com/docs/webhooks/validate-test/)
