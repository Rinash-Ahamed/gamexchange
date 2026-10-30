# Cart and Razorpay test checkout

## Implemented

- Add to cart on the shop grid and both homepage shelf presentations. A navigation cart icon shows quantity on desktop and mobile. The themed `/cart` page supports multiple products, stock-aware quantity controls, removal, unavailable-item warnings and one combined WhatsApp enquiry.
- Browser storage contains only product IDs and quantities, capped at 30 different products and 99 units per line. It is untrusted convenience state, not an authoritative price, reservation or order. Storage-disabled visitors retain an in-memory cart. Cart rendering uses hydration-safe external-store subscriptions and cross-tab updates.
- Test checkout re-reads current inventory directly from Firestore without public cache/demo initialization. It validates availability, stock quantities, positive whole-rupee prices and the expected INR subtotal. Amounts sent to Razorpay use integer paise. Changed prices/stock require refreshing the cart.
- The server creates the Razorpay order and retains a product/price snapshot in `checkoutTestOrders`. Request UUIDs provide duplicate-create protection. Successful client callbacks require HMAC signature verification using the stored gateway order ID, plus an authenticated gateway fetch checking payment ID, amount, currency, order association, captured status and no refunds. No client success flag is trusted.
- Signed `payment.captured` and `order.paid` webhooks reconcile missed callbacks. Signatures are checked against the original request text before JSON parsing. Reconciliation re-fetches gateway status; transactions make duplicate callback/webhook delivery idempotent and do not regress paid status on failed attempts.
- Admin > Test orders shows the latest 50 sandbox records. It is read-only, requires the same MFA session as the rest of admin, and explicitly prohibits fulfilment.
- Sandbox orders do not reserve or decrement real inventory, collect real money, create shipments or represent real customer sales. Live keys are rejected, not silently accepted. There is no live-payment switch in this implementation.

## Configuration

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
- The cart itself persists independently; local price displays may be stale until refresh, but the server rejects mismatched checkout totals. The snapshot is a test quote, not a reservation. Test order success does not imply that stock is held.
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
