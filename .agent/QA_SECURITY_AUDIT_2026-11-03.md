# End-to-end QA and security audit

Date: 2026-11-03. Scope: repository, local production build, browser regression suite and non-destructive API checks. This is an audit, not a remediation update.

## Third batch: theme and browser-test stability, 2026-11-03

- Repeated the previous four desktop cases with two workers, three repetitions: five passed and seven failed, largely clock, reload and axe execution timeouts. This is evidence of unstable concurrent browser execution on this workstation, not proof that every failure is an application defect or a production performance measurement.
- Fixed a genuine scheduling edge case: an already-armed automatic boundary callback now rechecks the latest stored manual preference. Added a test that toggles twice before 6 PM and verifies its explicit light preference survives that boundary.
- Initial theme bootstrap now records a non-DOM completion flag keyed by Symbol.for("gamexchange.theme.initialized"). Startup/reload tests wait for this actual completion signal before asserting the selected theme. A first diagnostic using Performance marks was discarded because the fake browser clock does not retain those entries. The old test title claiming a before-hydration guarantee was corrected to describe client bootstrap. No new executable script tags, cookie-dependent SSR or hydration suppression were added. This does not guarantee theme selection before the first paint on a slow connection.
- Boundary-clock tests use the shared shell on /policies, avoiding unrelated homepage timer advancement. Cross-route preference and homepage scroll/color checks remain.
- Accessibility checks wait for fonts and finite entrance transitions to settle. Infinite decorative animations continue; no color-contrast rule or affected node is excluded. Failures now include axe details, not only selectors. These are settled-content checks, not a certification of every intermediate animation frame.
- Default browser workers set to one for deterministic local/CI runs, consistent with [Playwright CI guidance](https://playwright.dev/docs/ci#workers). Explicit concurrency remains available for a separate stress run. This changes test scheduling only, not application smoothness or rendering quality.
- Final source passed lint and production build/TypeScript, including all 14 isolated API checks. All 88 repeated theme/accessibility cases passed: desktop and mobile emulation, both palettes, six public routes, two repetitions, one worker, no retries/skips (5.6 minutes). This includes bootstrap/reload, automatic boundary, manual preference at an armed boundary, scroll retention, cross-route storage, reduced motion and interrupted/hidden transitions. No live Firebase, cloud configuration or payment access was used.

Final artifacts: test-results/stability-final/results.json and its artifacts directory (gitignored). The discarded Performance-mark run is not included in these passing counts. The earlier parallel diagnostic remains five passed/seven failed: a single-worker acceptance pass does not establish parallel stress stability or production FPS. The whole unrelated inventory/cart/admin suite was not rerun in this turn. Existing image fixtures mean these checks do not verify real-image contrast/crops/LCP or native device behavior. Audit-owned servers were stopped after verification.

## Second remediation batch, 2026-11-03

- Configured Firebase deployments now use transactional shared rate limits and nonce consumption, with HMAC document IDs, signing-secret validation, expiry checks and failure-closed temporary responses. SDK imports are deferred until the shared path is used. No remote rules/settings/TTL changes or live verification were performed. See SECURITY_OPERATIONS.md for the two temporary TTL policies, costs and remaining staging checks.
- Added protected /admin/activity for the latest 50 inventory/category/service mutations. Audit entries commit atomically with each covered change, use the verified actor UID and exclude customer details/notes. This is not owner-proof immutable storage, full content-editor coverage or an undo feature.
- Added protected read-only /admin/health and /api/admin/readiness. Anonymous readiness is rejected. It checks database reads, bucket listing and signing configuration; not write access, payment readiness or scheduled monitoring.
- Compatible lockfile updates installed (including ESLint 10.14.0 and typescript-eslint 8.72.1). The completed registry scan still reports 16 moderate entries overall, six production; no high/critical reported. Incompatible major overrides/downgrades were not forced. Dependency finding remains open.
- Final lint and production build passed, including TypeScript and the expanded 14-check API gate. Earlier sandbox spawn EPERM and concurrent SDK/API cold-load timeouts were diagnosed separately; contract deadlines now allow 30 seconds for the SDK import and 15 seconds per HTTP check. They are not performance SLOs. Gate/browser-owned servers explicitly isolate real Firebase/payment configuration.
- Initial full browser rerun: 153 passed, three failed, 12 skipped. All theme/security/boot and 12 viewport sweeps passed. Failures were an incorrect first-FAQ open-state assertion and one premature mobile CTA interaction. The first focused run passed CTA/FAQ/a11y, but repeated enquiry tests shared prior rate-limit state and one form clicked before hydration. Browser fixture identities/phones and form readiness waits were corrected. A final affected-flow rerun is recorded after completion below.

User reports ENQUIRY_SECRET is configured. Its value/hosting state was not inspected. Existing business data and unrelated edits remain preserved. Still next: live/emulator shared-store and audit acceptance tests, TTL configuration, cloud rules/IAM/backups/restore, dependency remediation, CSP/provider compatibility, broader audit coverage, backend scale and complete live checkout. Live payment keys remain blocked.

Final validation: production build/TypeScript, lint and all 14 isolated postbuild checks passed. The 92-case affected desktop/mobile run finished with 88 passed and four failed (one homepage contrast snapshot and three desktop theme/startup timing cases). All four passed in a subsequent serial diagnostic run (4/4, 12.7 seconds). Do not describe the parallel suite as green or the root cause as fully resolved. CTA/FAQ/enquiry/boot/security and mobile theme checks passed in the affected run. Accessibility now scans unlocked content rather than the boot-inert shell; one contrast result was intermittent and still needs stable entrance/paint investigation. Existing optimized-image stubs and lack of live cloud/provider verification still limit sign-off.

Artifacts: test-results/priority-results.json (initial full run), test-results/priority-focused/results.json (first focused run), test-results/priority-final/results.json (92 cases), test-results/priority-serial/results.json (four serial diagnostics). They are gitignored generated files, not durable evidence exports. Audit-owned servers were stopped after verification.

## First remediation follow-up, 2026-11-03

The findings/results below describe the pre-fix audit. This section records the first remediation turn; the second batch above supersedes its verification and outstanding-work status.

- QA-01: boot show/focus callbacks are canceled and guarded once dismissal starts; backgrounding and Escape dismiss and unlock the intro. Added delayed-frame/skip regression source.
- QA-02: removed automatic inventory seeding entirely. Public category reads no longer initialize the registry. Admin category setup remains; existing records/markers are untouched. Unconfigured local demo fallback remains, but it never imports stock into Firebase.
- QA-03: optional homepage reads now settle failures separately. Artwork uses bundled originals; failed promotions/FAQs show an unavailable message, rather than inventing managed content or rejecting the homepage. Errors are logged without provider details. Catalogue outages/readiness monitoring and other routes still need separate work.
- QA-05: inventory edits require the original updatedAt and reject stale saves inside the Firestore transaction. Cleanup still removes a failed replacement upload. No record migration or immutable audit trail was introduced.
- QA-07: enquiry token/submission requests have a 15-second fetch/body timeout, abort on unmount, deduplicated token warming and an in-flight submit guard. Phone variants normalize to the same 10-digit number before per-phone limits.
- QA-08/09: updated CTA/FAQ selectors and isolated security-test identities. Theme listeners recheck stored preference/time when subscribing and on focus/visibility return. Added a hydration-ready marker and deterministic readiness/clock/color assertions. This does not establish that every previous theme/paint failure is resolved.
- SEC-01: added ENQUIRY_SECRET to .env.example and setup guidance. No local/hosting secret was edited. Distributed rate/replay storage remains outstanding.
- Corrected bundled buying FAQ instructions. Existing managed Firestore FAQ content is not overwritten; update it through admin if already initialized.

Verification in the remediation turn: source/diff and whitespace review only. Build, lint, typecheck, browser tests and live Firebase remain deferred until explicitly requested. Prior passing audit checks do not validate these new changes.

Still next: compatible dependency remediation, distributed abuse controls, CSP nonce/provider compatibility, cloud permissions/backups/secret rotation, authenticated concurrency/upload acceptance tests, durable audit history, backend pagination/load measurements and the complete live order lifecycle. Live Razorpay keys remain blocked.

## Executive assessment

Do not treat a passing build as production sign-off. The highest-priority findings are a reproducible boot-screen race, demo inventory initialization from a public read, dependency-failure isolation and the unfinished live purchasing lifecycle. Authentication has meaningful server-side protections, but cloud permissions and actual provider workflows require separate staging verification.

No application fixes or dependency updates were made. Existing edits to `FranchiseVideo.tsx` and session documentation were preserved. No credentials or customer records were inspected. No emails, WhatsApp messages or payments were sent.

## Checks performed

- `npm.cmd run lint`: passed.
- `npm.cmd run build`: passed on retry with permission to launch child processes. Includes TypeScript and 13 postbuild API/import checks. The first sandboxed attempt compiled but hit `spawn EPERM` during TypeScript, an environmental failure.
- Postbuild checks covered Firebase Admin module loading without CommonJS/ESM bridging, liveness/no-store, token origin checks, enquiry origin/token/body limits, admin-session cross-origin rejection, checkout cross-origin/malformed requests and unsigned webhooks. They do not establish Firebase connectivity or payment readiness.
- Full Playwright suite: 139 passed, 13 failed, 12 skipped (164 total, 7.1 minutes). Includes desktop Chromium and a Chromium mobile-emulation project, not native Safari or physical devices. A fresh-server serial mobile security/theme rerun passed 14 of 17 tests, with three theme assertions still failing.
- Separate browser timing probe: delayed animation frames while timers continued; the boot overlay remained visible after six seconds, although the site shell had already been unlocked.
- Unauthenticated local requests to inventory, services, banners and franchise admin pages returned Next streaming redirect markers to `/admin/login`. Streaming HTTP 200 alone is not an authentication bypass. Source review also checked authorization before protected reads and mutations.
- `npm.cmd audit --json --offline=false`: 16 moderate affected-package entries, zero high/critical. `--omit=dev`: six moderate entries, zero high/critical. These are transitive dependency counts, not 16 distinct exploitable application flaws.
- Source reviewed: catalogue/filter/pricing/cart flows, enquiry validation and abuse controls, admin authentication/actions, image processing/access, inventory/category initialization and writes, managed homepage content, checkout/order/webhook verification, security headers and test coverage.

### Isolation and verification limits

The initial browser run was stopped and discarded after server logs showed blocked Firestore connections. Empty environment overrides did not reliably isolate Next's dotenv loading. The rerun used nonempty whitespace project/key overrides, which application guards trim to empty, plus a loopback-only unavailable Firestore emulator address as a safety backstop. The rerun logged local demo catalogue fallback, rather than successful remote access. No successful live Firebase read or write was observed.

Live Firebase authentication, verified email, TOTP enrollment/recovery, authenticated CRUD, Storage uploads/deletions, deployed rules/IAM, database retention/backups, Vercel configuration, Razorpay callbacks/webhooks and settlement were not verified. Do not infer production health from the fixture run. Existing tests replace optimized image responses with a one-pixel PNG, so their layout checks do not establish real artwork quality, image delivery performance or LCP. No 120 FPS guarantee or production load-test conclusion is justified.

## Prioritized findings

### QA-01: Boot overlay can permanently block clicks

Priority: high. Status: reproduced in a controlled browser timing probe; also observed in a browser-suite navigation failure.

Evidence: `src/components/ui/BootScreen.tsx:38` schedules `setPhase("booting")` in an animation frame. Independently, timers at lines 55-59 set leaving/hidden and unlock the site. If the frame is delayed until after those timers, it can set the phase back to booting with no remaining hide timer. The probe delayed frames, waited six seconds and observed `bootVisible: true`, `shellInert: null`. The normal suite also recorded `.boot-console` intercepting a navigation click for the full 30-second timeout.

Impact: first visits can appear frozen when frame scheduling is delayed, for example around tab visibility changes. This is separate from slow Firebase and stale test selectors.

Recommendation: make boot phases monotonic. Cancel or invalidate pending show/focus frames when leaving, hiding or skipping. Check the active phase/session before displaying, and add a hard cleanup path plus a deterministic delayed-frame regression test. Verify both reduced motion and tab visibility transitions.

### QA-02: A public catalogue read can create active demo stock

Priority: high for production data integrity. Status: confirmed by source, deliberately not exercised against a real database.

Evidence: `src/lib/admin/db.ts:148` initializes an empty database from bundled products, setting `stock: 1` and `status: "active"`. `listPublicInventory` at line 187 invokes this initialization. The marker prevents repeated seeding after intentional deletion, but a fresh database without the marker still receives demo stock from a public read. Category initialization also writes during the read path.

Impact: visitors can see products that the shop has never actually stocked. Production reads unexpectedly require write permissions and initialization availability.

Recommendation: make demo seeding an explicit development-only command or confirmed admin setup action. Production public reads should be read-only and return a deliberate empty state until genuine inventory is published. Preserve the existing initialization marker and real data during migration.

### QA-03: Optional managed-content failures can take down the homepage

Priority: high for availability. Status: source-confirmed; blocked dependency requests also caused route errors in the discarded initial run.

Evidence: `src/app/page.tsx:21` starts banner, FAQ and homepage-image reads and uses Suspense fallbacks. `src/components/home/HomeData.tsx` awaits them without a section-level error boundary or explicit last-known-good/error fallback. Suspense handles waiting, not a rejected data read. `readPublicProducts` also propagates configured Firestore failures. Previously reported credential errors and this audit's blocked network errors are consistent with that failure path.

Impact: a Firebase credential or availability issue can replace otherwise usable public content with the generic route error. `/api/health` can still pass because it is liveness only.

Recommendation: isolate optional sections, use explicit degraded/error states and consider bounded last-known-good public data. Add a separate authenticated/read-only readiness check with timeouts and alerting. Never disguise invalid credentials as a healthy catalogue or publish demo inventory as recovery.

### QA-04: Checkout is sandbox infrastructure, not a complete purchase flow

Priority: high launch blocker if real purchases are expected. Status: intentional current limitation, not a claim of a payment-verification bypass.

Evidence: `src/lib/payments/razorpay.ts:9` only accepts test keys. `src/lib/payments/orders.ts:86` deliberately does not reserve/decrement real stock. Test orders do not implement customer delivery details, fulfilment, refunds or a customer order-recovery page. Browser-side checkout recovery is limited after closing/reloading the page.

Impact: simply replacing environment keys cannot enable safe live commerce. Multiple customers could otherwise purchase the same stock, and a paid customer needs a durable recoverable order and fulfilment path.

Recommendation: keep live keys blocked until stock reservation/release, idempotent capture/stock commitment, durable order status/reconciliation, customer contact/delivery capture and fulfilment/refund handling are implemented and tested in staging. Test successful capture, duplicate callback/webhook, failed verification, closed browser, timeout, refund and competing last-unit orders.

### SEC-01: Serverless abuse limits and token replay state are process-local

Priority: medium. Status: source-confirmed design limitation.

Evidence: `src/lib/rate-limit.ts:3` stores limits in a process-local Map; `src/lib/security.ts:22` stores used token nonces in another Map. Separate Vercel instances do not share them. `security.ts:9` generates a per-process signing secret unless `ENQUIRY_SECRET` is set. That required multi-instance setting is absent from `.env.example`, although documented in source.

Impact: rate/replay controls reset on restart and do not provide a deployment-wide ceiling. Without a stable secret, a legitimate token issued on one instance can fail validation on another. Setting the secret fixes cross-instance verification, not distributed replay protection.

Recommendation: provide a strong server-only stable signing secret in the deployment template and add shared atomic rate/replay storage with TTLs. Retain bounded request bodies, expiry and timing-safe signatures. Validate proxy/IP trust on the actual hosting platform; this audit did not establish an IP-spoofing bypass on Vercel.

### SEC-02: Known moderate dependency advisories remain

Priority: medium. Status: confirmed by registry audit on the installed lockfile.

Production graph includes `glob@10.5.0` and `minimatch@9.0.9` through Firebase Admin's Firestore/google-gax/rimraf dependency chain. Development tooling also includes `minimatch@10.2.6`. Audit reported six moderate production-package entries and 16 overall, representing propagation of two underlying advisory families.

- [minimatch pattern-amplification denial of service](https://github.com/advisories/GHSA-g3hv-75wg-m249), patched in 11.0.1.
- [glob cancellation bypass and continued filesystem traversal](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4), patched in 14.0.2.

No public application path accepting attacker-controlled glob patterns was identified in the reviewed code. Dependency presence does not prove remote exploitability. Recommend compatible upstream dependency updates and rerun lint/build/API/browser checks. Do not blindly run `npm audit fix --force`: this audit suggested substantial tooling downgrades, and overriding incompatible major versions is not a safe automatic fix.

### SEC-03: Production CSP still allows arbitrary inline scripts

Priority: medium, defense in depth. Status: confirmed configuration, no XSS exploit established.

Evidence: `next.config.ts:10` includes `script-src 'unsafe-inline'`. Production excludes development-only `unsafe-eval`, which is correct. React escaping, validation and safe JSON-LD serialization mitigate reviewed sinks, but the current CSP would not strongly contain a future inline-script injection.

Recommendation: plan a nonce/hash-based production script policy compatible with Next rendering and Razorpay. Validate provider behavior in staging before tightening it. Avoid breaking payments or adding `unsafe-eval` in production as a workaround.

### QA-05: Concurrent inventory edits can silently overwrite newer values

Priority: medium. Status: confirmed by source; not tested against customer data.

Evidence: `src/lib/admin/db.ts:259` reads current inventory in a transaction but writes the complete submitted fields without checking the editor's original revision. A transaction protects SKU uniqueness, not stale form values. Two open editors can overwrite stock/price changes in sequence.

Recommendation: require an expected `updatedAt` or revision, show a conflict message and refresh before saving. Add an append-only audit trail recording who changed stock, price, status, customer records and managed content. Current timestamps alone do not provide reversible change history.

### QA-06: Pagination reduces displayed cards, not backend data volume

Priority: medium as stock/customer records grow. Status: source-confirmed scalability gap, not a production benchmark.

Evidence: public catalogue reads fetch all active inventory then filter/sort in application code; client pagination slices the full product payload. Admin inventory and unrestricted service-record lists also load whole result sets. Existing 20-card pagination tests do not measure Firestore cost or response payload at realistic scale.

Recommendation: measure 100/1,000/10,000-record fixtures, then implement indexed server-side queries/cursor pagination and appropriate facet aggregation. Keep useful filters and stable category IDs. Do not promise constant-time navigation from small demo data.

### QA-07: Enquiry fetches have no client timeout

Priority: medium. Status: source-confirmed reliability gap.

Evidence: `src/components/forms/use-enquiry.ts:24` and line 67 use fetch without an AbortSignal or bounded timeout. A stalled token/submission request can leave a form submitting indefinitely.

Recommendation: add bounded requests, recoverable errors and cancellation on unmount, preserving entered values and single-use token semantics. Keep the existing honest "ready to send" state: these forms prepare WhatsApp messages, not database bookings or automatically delivered enquiries.

### QA-08: Regression coverage needs maintenance and provider fixtures

Priority: medium. Status: confirmed coverage limitation and stale assertions.

The hero CTA test still searches for `Enter game zone` and `Explore gear`, while current hero buttons use updated labels. Other flows must be judged against current UX rather than an old test expectation. There are no complete authenticated admin/MFA/upload/payment-provider fixtures in the reviewed suite. The responsive sweep covers six routes at 12 widths, but not every admin view or actual image visual quality. Axe covers only six public routes and starts close to boot-screen timing, so it is not a complete accessibility certification.

Recommendation: update tests to current accessible names, use deterministic fixtures and unique test identities, wait for meaningful readiness rather than fixed delays, and add Firebase emulators/provider mocks plus a separately authorized staging acceptance suite. Cover native mobile Safari and real media delivery.

### QA-09: Theme behavior is not ready for test sign-off

Priority: medium. Status: failing automation, root cause not fully isolated.

The full run had six failing theme assertions across desktop/mobile: scheduled boundary switching, first-visit scroll position, computed background color and hidden-tab storage updates. A serial fresh-server mobile rerun still failed the scheduled boundary, background-color and hidden-storage assertions. These cannot all be dismissed as parallel-suite interference.

There are test timing weaknesses: the boundary test starts only 500 ms before 6 PM and immediately asserts after navigation, and a visible SSR button is not proof that storage listeners have hydrated. Independent probes after a hydration wait confirmed theme attribute/storage changes; on `/contact`, the computed background also changed to light after a longer wait. On `/`, a shorter probe changed the theme attribute but still read the old body background after 700 ms. This establishes a need for focused timing/paint investigation, not a conclusion that theme switching always fails.

Recommendation: add explicit client readiness, deterministic boundary-clock progression and first-visit/returning-visit fixtures. Test actual foreground/background tabs and poll rendered colors rather than using a fixed 450 ms delay. Investigate delayed paint and listener registration before modifying theme logic. Theme smoothness and scheduled switching remain unsigned-off.

## Additional security and operational follow-ups

- Cloud rules/IAM/backups are unverified, not confirmed insecure. The Admin SDK bypasses Firestore client rules. Verify deployed Firestore/Storage client rules deny unauthorized access, server credentials are least privilege, App Hosting/Vercel secrets are server-only, backups/PITR are enabled where appropriate, and restore is actually rehearsed. No deployed rule configuration was obtained in this audit.
- Any secret previously pasted into chat or logs should be rotated. Do not publish the value or assume deleting the message invalidates it. TOTP recovery/administrator loss procedures also need an owner-approved runbook.
- Admin logout deletes the browser session cookie but does not revoke an already stolen copy server-side (`src/lib/admin/auth.ts:71`). Consider session-specific invalidation or an explicit revoke-all-devices operation for incident response. Current verified/revoked-cookie checks do not make browser logout a global revocation.
- Normalize phone numbers to one canonical representation before per-phone limits. The current validation accepts multiple country-code representations of the same number, while the limiter keys the resulting string.
- Public optimized-image caches may retain previously published artwork after unpublishing. Draft authorization checks do not make an already public asset immediately revocable. Do not upload confidential documents/customer photos as public promotion assets.
- Privacy draft approval, retention/deletion policy and business-copy promises need owner review before real transactions. This audit is not legal approval.
- The bundled buying FAQ still tells customers to select `Enquire`, which was removed from consumer cards. Update that instruction to the actual product/cart/team-contact journey without implying live payments are enabled.

## Controls that were present

- Server-side admin UID allowlist, verified email, recent authentication and TOTP requirement; password-only login is not enough for the admin session.
- Revocation-checked session verification and current-user checks, with HttpOnly, SameSite Strict and production Secure session cookies.
- Authorization in protected page/data and mutation paths, not just hidden navigation.
- Origin checks, schema validation, bounded actual request bytes, timing-safe signatures, token expiry, honeypot and bounded single-process rate-limit maps.
- Server-calculated current checkout amounts, INR/amount/order/capture checks, callback/webhook signatures and idempotent paid-state transactions in the test-payment flow.
- Image decode/re-encode and file/dimension limits rather than trusting filenames alone; version/publication/authorization checks around managed images.
- No production `unsafe-eval`; frame/object restrictions and other security headers. Current tracked env-file inventory contains `.env.example`, not `.env.local`; full git-history secret scanning was not performed.

## Recommended order

1. Fix and regression-test the boot-frame race; remove implicit production seeding.
2. Isolate public content failures and establish dependency readiness monitoring.
3. Resolve compatible dependency updates; make signing configuration and distributed abuse controls production-ready.
4. Add optimistic concurrency/audit history and verify cloud permissions/backups in staging.
5. Implement the full live order lifecycle only when approved, then verify real provider test-mode scenarios before accepting payments.
6. Refresh the regression suite and measure real-device/media performance before performance sign-off.

## Final browser result

Full suite: 139 passed, 13 failed, 12 intentionally skipped. No retries. The 12 skips are mobile duplicates of the desktop viewport sweep, not failed layouts. All 12 desktop viewport widths (320 through 1920 px, including landscape sizes) passed their checks across the six public routes. These are geometry checks using stubbed optimized images, not a full visual review.

Failure breakdown:

| Group | Failed cases | Interpretation |
| --- | ---: | --- |
| Hero CTA and FAQ selectors | 4 | Obsolete accessible names in tests; source confirms the labels/questions changed. |
| Navigation blocked by boot overlay | 1 | Actual timing defect, independently reproduced with delayed animation frames. |
| Theme assertions | 6 | Unresolved timing/paint/readiness behavior; see QA-09. |
| Mobile enquiry API | 2 | Shared server rate-limit state between project runs; both passed against a restarted isolated server. |

Fresh-server serial mobile security/theme rerun: 14 passed, three failed, no skips (17 cases, 1.0 minute). All eight mobile security cases passed. The three remaining failures were theme boundary, computed color and hidden storage synchronization. The rerun does not replace or erase the full-suite result.

Generated local artifacts are in `test-results/audit-results.json` and `test-results/focused/audit-focus.json`, with error-context files alongside them. They are gitignored, disposable test output. The separate delayed-frame probe and theme probes are described above; no permanent application/test behavior was changed to obtain these results. The discarded connectivity run is excluded from reported counts.
