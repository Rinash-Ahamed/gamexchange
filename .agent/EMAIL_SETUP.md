# Gmail notifications

## Current status

Backend order notifications are implemented with Nodemailer and Gmail SMTP. New server-verified captured payments queue customer confirmation and business notification; Parcel Sent queues one shipping confirmation. The confirmed business recipient is finance.gxc@gmail.com. Current checkout remains TEST ONLY: every template and subject explicitly identifies simulated orders, and no real inventory or shipment is created. Repair emails are not part of this implementation. No SMTP or live provider verification has been performed.

Customer Google sign-in is independent of Gmail SMTP. Shopper login does not require an App Password and must never request access to the shopper's mailbox. Generate the password only for the business account that will send notifications.

## Create an App Password

1. Sign in to the intended sending Gmail account.
2. Enable 2-Step Verification in Google Account > Security.
3. Open [App Passwords](https://myaccount.google.com/apppasswords), name the app GameXchange Website and create its password.
4. Copy the generated 16-character password into SMTP_PASS in .env.local and Vercel server environment settings, without the display spaces. Do not paste it in chat, source code, documentation or NEXT_PUBLIC_ variables.
5. Set SMTP_USER to that sending account's full Gmail address. The password must belong to SMTP_USER, not merely to the notification recipient.

App Passwords may be unavailable for organizational accounts, Advanced Protection or security-key-only 2-Step Verification. Changing the Google account password revokes existing App Passwords; create a replacement if needed. Prefer OAuth for a future production-grade Gmail integration where feasible.

## Variables

```dotenv
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-sending-account@gmail.com
SMTP_PASS=your-16-character-app-password
MAIL_FROM_NAME=GameXchange
NOTIFICATION_EMAIL=finance.gxc@gmail.com
CRON_SECRET=replace-with-an-independent-random-secret-at-least-32-characters
```

The sender address is SMTP_USER; MAIL_FROM_NAME is its display name. Port 465 uses TLS from connection start. Port 587 requires SMTP_SECURE=false and STARTTLS. Only smtp.gmail.com is allowed, certificate verification remains enabled, and arbitrary file/URL attachments are disabled. The existing trusted PNG logo is attached as an inline CID image, with plain-text alternatives and HTML escaping for customer/product content. Restart locally or redeploy after environment changes.

## Queue, status tracking and duplicate protection

- `checkoutTestOrders` remains the authoritative order store. Payment confirmation still requires valid signatures/ownership and a server Razorpay fetch matching captured status, amount, currency, gateway order and refund state. Visiting a success page cannot enqueue a receipt.
- The paid transition, Order Placed history and deterministic `orderEmails` confirmation/business jobs commit together. Concurrent callback/webhook retries cannot create extra jobs. Every actual separate purchase gets its own receipt.
- Admin > Test orders > Manage order and emails shows customer/contact/address/items/payment IDs, history, current fulfilment stage and notification state. Only paid orders can advance, one stage at a time: Order Placed, Packed, Parcel Sent, Delivered. Admin UID and time are stored for changes. Repeated or stale submissions cannot create a second shipment job. Courier, tracking number and HTTPS URL are optional when marking Parcel Sent.
- Normalized case/whitespace and Gmail dot/plus aliases are checked when business/customer mailboxes coincide; the redundant business message is suppressed, while the customer receipt includes the full details. Different domains do not receive Gmail-specific alias normalization.
- Job statuses: pending, sending, sent, failed, blocked, uncertain, suppressed. Admin sees attempts, recipient, updated time and a safe result note. Sent means Gmail accepted the message, not guaranteed inbox delivery. No SMTP password, raw provider error or payment-card data is stored in the job.
- A transactional sending lease prevents concurrent dispatch. Fixed Message-ID is supplementary, not an SMTP exactly-once guarantee. Definite connection/rejection failures retry with backoff up to five attempts. Missing SMTP configuration/recipient is blocked and checked again after 15 minutes. Admin can explicitly retry pending/failed/blocked jobs.
- Uncertain network outcomes or an expired sending lease stop automatic resends. Check Gmail Sent using the order reference/Message-ID. Uncertain jobs deliberately have no resend button; manual reconciliation is required before any operational resend to avoid duplicates. Do not edit/delete a sending job or use its queue record as a general-purpose SMTP sender.
- Email dispatch runs after the payment/status response via Next after(), with errors isolated from successful order placement. Historical paid orders are not backfilled or mass-emailed. Existing missing shipping/customer data displays Not available.

## Required scheduled retry worker

Configure a trusted scheduler to call `GET https://your-domain/api/internal/order-emails` every 30 minutes (`*/30 * * * *`), with header `Authorization: Bearer <CRON_SECRET>`. Use an independent random secret at least 32 characters long and store it only server-side. Never put it in the URL or public frontend settings. Initial notifications still send immediately after payment verification or Parcel Sent; this interval applies only to the scheduled retry worker. Retry backoff and configuration-check timestamps are earliest eligibility times, so actual scheduled processing waits for the next 30-minute run.

The worker processes at most five due jobs concurrently per call, including expired sending leases. Pending times use one indexed Firestore inequality; no composite index is required. A bounded batch prevents slow SMTP from occupying the public request. Increase scheduler frequency only after monitoring quota/backlog. Gmail sending limits still apply; this is not a bulk-mail service.

Audit follow-up: the worker returns 503 when queue querying or job processor persistence fails, and emits sanitized queue error events rather than silently reporting success. A 200 response means processing ran, not that every email reached an inbox. At one five-job run every 30 minutes, the scheduled recovery ceiling is ten jobs/hour before accounting for retries; initial event-triggered sends are separate. Monitor backlog and uncertain states. Vercel Hobby does not support sub-daily cron; verify the current plan or use an approved trusted scheduler without changing hosting automatically.

No scheduler or Vercel deployment configuration has been created remotely. Configure it for the hosting plan you use. Vercel Cron can supply CRON_SECRET automatically when configured, but its frequency limits depend on the plan. Without a scheduler, first sends still run automatically after verification/status change; delayed retries require a repeated callback or the admin Retry action. Do not consider background retry operational until the scheduler is configured.

Keep checkoutTestOrders and orderEmails inaccessible to untrusted Firebase browser clients. This application uses the server Admin SDK and authenticated admin actions; Admin SDK bypasses Firestore Security Rules. Never add TTL deletion to these permanent order/email records.

## Verification before use

The 5 November production audit passed build/lint/typecheck, the 16-check fixture API gate and desktop/mobile regressions for deterministic identities, duplicate mailboxes, retry exclusions, forward stages, escaped templates and unauthorized worker access. Full run history and limits are in PRODUCTION_READINESS_2026-11-05.md. Authenticated admin interactions, concurrent callback/webhook races, Firestore transactions, Gmail rendering/delivery, SMTP rejection/timeouts and scheduled processing still require staging verification. Do not activate live payment keys as part of SMTP setup; the separate test-only checkout guard remains intact.

References reviewed on 2026-11-03: [Google App Password instructions](https://support.google.com/accounts/answer/185833?hl=en) and [Gmail SMTP/TLS settings](https://developers.google.com/workspace/gmail/imap/imap-smtp).

SMTP transport reference reviewed for this implementation: [Nodemailer SMTP transport](https://nodemailer.com/smtp).
