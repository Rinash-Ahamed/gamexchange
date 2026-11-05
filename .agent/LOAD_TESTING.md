# Isolated staging load-test runbook

Prepared 5 November 2026. No k6 test has been executed and no concurrent-user capacity is certified.

## Safety and prerequisites

1. Use a separate staging Firebase project/database/bucket and Razorpay TEST account/settings, synthetic stock, dedicated Google test users and disposable shipping details. Disable staging SMTP at the environment level, not merely via a script flag. Never reuse production customer records or credentials.
2. Confirm BASE_URL and STAGING_ORIGIN refer to the same isolated deployment. Scripts require ISOLATED_STAGING=true and block the known production domains. These guards cannot prove database isolation or detect every production alias; a human must verify the backing resources first.
3. Install k6 on the test machine. It is not an npm dependency. No k6 executable was available on this workstation during the audit. Set up resource metrics and billing alerts before generating traffic.
4. Run only 10 VUs first. Inspect errors, throttling, database operations and cost. Advance individually to 50, 100, 500 and 1,000 only after the preceding run is healthy. Do not execute the full ladder unattended. Stop on sustained 5xx/timeouts, excessive transaction contention, quota warnings or unexpected writes/emails.
5. Do not deploy, tune CPU or migrate hosting as part of these scripts. Keep rate limits enabled. Use a dedicated test runner, not the production application's own function.

## Storefront workload

From the repository root, in PowerShell:

```powershell
$env:BASE_URL = 'https://YOUR-ISOLATED-STAGING-HOST'
$env:STAGING_ORIGIN = $env:BASE_URL
$env:ISOLATED_STAGING = 'true'
$env:PRODUCT_IDS = 'YOUR-PUBLIC-STAGING-PRODUCT-ID'
$env:VUS = '10'
k6 run --summary-export tests/load/results/storefront-10.json tests/load/storefront.js
```

Create the ignored tests/load/results directory first if the installed k6 version requires an existing output directory. Repeat deliberately with VUS=50, 100, 500 and 1000, changing the summary filename for each run. Each profile ramps for 30 seconds, holds for two minutes and ramps down for 30 seconds. HOLD can extend the steady stage for an explicitly planned soak test.

Covered: product listing, server-rendered search/section/platform query, product details, homepage and liveness. This is HTTP/SSR load only: k6 does not hydrate React, run client-side facets, fetch CSS/images or measure LCP/INP/FPS. Existing Playwright checks cover actual filter and mobile interactions. Image/CDN cold-encoding and realistic browser traffic require a separately approved browser load plan and real staging artwork.

Initial investigation thresholds: <1% failed HTTP requests, p95 <1.5 seconds and p99 <3 seconds. These are proposed goals, not current measurements or promises. Confirm they match the business SLO and user geography before using them as a release contract.

## Authenticated checkout workload, separate run

There are no hospital/consultant booking endpoints in GameXchange. Public repair and gaming enquiries prepare WhatsApp drafts rather than database bookings, so a booking-write load test would be misleading. The corresponding durable consumer write flow is sandbox checkout.

Create an ignored tests/load/customers.local.json with one unique test Google account per VU. Each entry contains a current Firebase idToken, items [{id, quantity}], expectedAmount in paise and shipping {name, phone, addressLine1, addressLine2, city, state, postalCode, country: IN}. Use only synthetic addresses. Prepare tokens through approved staging authentication; the script does not bypass Google or MFA and does not store admin passwords. Never commit tokens or paste them into a report.

```powershell
$env:ALLOW_CHECKOUT_WRITES = 'true'
$env:STAGING_EMAIL_DISABLED = 'true'
$env:CUSTOMERS_FILE = './customers.local.json'
$env:VUS = '10'
k6 run --summary-export tests/load/results/checkout-10.json tests/load/checkout.js
```

The customers path is resolved by k6 open() relative to the script. Each VU performs one checkout creation and one retry with the same UUID and asserts the gateway order ID is reused. This creates staging Firestore and Razorpay test-order records, but does not capture a payment or modify real inventory. Client privacy version must match checkoutPrivacyNotice when it changes.

Optional verification fixtures: each user's verification object contains an already prepared and captured sandbox requestId, razorpay_order_id, razorpay_payment_id and razorpay_signature for that same UID. Set ALLOW_VERIFICATION_FIXTURES=true only after review; the script posts the fixture twice to check idempotent verification. Verification can enqueue notifications, which is why staging SMTP must actually be disabled. Verify resulting order/job cardinality directly in staging; HTTP 200 alone cannot prove transactional uniqueness or actual SMTP delivery. Use separate cases for malformed amounts/signatures, ownership mismatch, pending capture, retries after disconnect and webhook replay. No card number, gateway secret or admin session belongs in this fixture.

Existing IP limits apply: checkout creation permits 12 requests per ten minutes per trusted client IP, verification 30. A single load runner with many VUs shares its real IP and will hit 429; record checkout_throttled separately. Do not spoof X-Forwarded-For or weaken production rate limits to make a chart pass. For legitimate throughput measurement use an approved staging-only ingress/identity strategy or distributed authorized runners. Keeping the anti-abuse workload separate from business-capacity measurement is essential. Initial checkout thresholds are <1% failed requests, p95 <2.5 seconds and p99 <5 seconds, subject to agreed SLOs.

## Measurements to collect for every profile

| Signal | Collection method |
| --- | --- |
| p50/p95/p99, failures and completed requests per second | k6 summary, operation name tags and exported JSON; retain run timestamps and workload version |
| Request volume versus iteration throughput | Record both http_reqs rate and iterations rate, since each iteration performs multiple requests |
| CPU, memory, starts, duration, throttling/timeouts | Vercel staging Observability/Runtime Logs during the same time window; these are not visible to k6 alone |
| Firestore reads/writes/deletes and contention | Staging project usage/Cloud Monitoring before, during and after; isolate unrelated traffic and transaction retries |
| Cache cold/warm behavior | Separate new-deployment/cache-miss and warmed runs; record location, dataset size and cache settings |
| Frontend experience | Separate mobile/desktop browser recordings with actual staging images, both themes and reduced motion |
| Email backlog and correctness | Count deterministic jobs, attempts, due age, uncertain jobs, verified paid orders and order history in staging |
| Spend | Staging Firebase/Vercel usage and budget alerts, not a theoretical conversion from VU count |

Run an overnight low-rate soak only after the short profiles and budgets are approved. A two-minute 1,000-VU run is not a 24-hour reliability or sustained throughput guarantee. Never infer simultaneous consumer capacity from the local single-user diagnostic.

## Local diagnostic, not load testing

After a production build, node scripts/audit-local-performance.mjs starts an owned loopback fixture server with Firebase/payments disabled, samples five routes sequentially and reports first/warm header/full-response times and all-route static chunk sizes. It never targets the live site. Its results exclude provider latency, image encoding, browser rendering and CPU/memory metrics. It does not read .env.local directly; Next may load it, but fixture project/payment overrides prevent operational access.

Official references: [k6 thresholds](https://grafana.com/docs/k6/latest/using-k6/thresholds/), [Firestore best practices](https://firebase.google.com/docs/firestore/best-practices), [Vercel Runtime Logs](https://vercel.com/docs/logs/runtime).
