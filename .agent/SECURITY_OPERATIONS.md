# Security operations and release checks

## Shared API protection

With FIREBASE_PROJECT_ID configured, enquiry token issuance/submission, admin-session creation and checkout guards use atomic Firestore transactions in securityRateLimits. Valid signed enquiry nonces are consumed atomically in securityTokenUses, preventing replay across instances. Origin/content/body guards remain. ENQUIRY_SECRET must be a server-only random value of at least 32 characters and identical across instances. Invalid/missing signing configuration or failed shared storage returns a temporary failure, never silently switches to per-process enforcement.

Only unconfigured local fixtures use bounded in-memory limits/nonces. The shared implementation is source/build checked, not yet verified against a live or emulated Firestore database. It adds Firestore reads/writes and possible transaction retries to API requests; measure latency and costs in staging. A 5-second caller deadline fails closed, but cannot cancel an already submitted Firestore transaction, which may commit after that deadline. Retrying can therefore be conservatively counted/consume a nonce; the browser obtains a fresh token.

Keys use HMAC digests, not raw phone/IP/token values. Rotation invalidates outstanding tokens and changes rate-limit keys. Treat rotation as a coordinated deployment. Edge/proxy IP trust and upstream bot/DDoS controls still matter; application limits are not a cost-proof WAF.

### Temporary-record cleanup

In Firestore TTL settings, create an expiresAt timestamp policy for these two collection groups only:

- securityRateLimits
- securityTokenUses

The app writes expiresAt as a timestamp. Expiry checks and atomic writes enforce correctness even when cleanup is delayed. TTL is asynchronous and is housekeeping, not the rate-limit clock. No TTL policies were enabled remotely by this update. Until configured, expired documents remain and incur storage costs; recurring rate keys reuse expired windows. [Firestore TTL guidance](https://firebase.google.com/docs/firestore/ttl).

Never enable these TTL policies on inventory, inventorySkus, serviceRecords, settings, franchisePhotos, homepageBanners, checkoutTestOrders or auditLogs. No automatic business-data deletion is introduced. Confirm billing/quota alerts and keep client rules closed to security/audit collections; Admin SDK access is server-side.

## Admin activity

/admin/activity shows the latest 50 inventory, category and service-record mutations. Each audited change and its history entry commit in one transaction. A failed audit write fails that mutation; it cannot leave an apparently successful unaudited business change. UID comes from the verified MFA session, not form fields. Failures before commit do not create a success entry.

History includes actor UID, action, resource ID, time and changed field names. Inventory/pricing/status summaries are allowlisted. Customer names, phone numbers, issues, notes, descriptions and images are not duplicated. There is no audit delete/edit UI or TTL. This is application-level append-only history, not cryptographic tamper resistance against a project owner or leaked service-account credential.

History begins after deployment; no backfill was run. Homepage content/image editors and provider-side account changes are not covered yet. There is no restore/undo function. Export/retention and access policies need owner review. Live concurrent-editor and audit-write-failure scenarios remain staging acceptance work.

## Readiness versus liveness

- /api/health: anonymous process liveness only, no database access.
- /admin/health: protected, read-only system checks.
- /api/admin/readiness: requires an admin session; anonymous requests get 401, failed dependencies get 503, and successful checks get 200. Responses are private/no-store and do not expose provider errors, secrets or record content.

Readiness checks database read access, bucket listing and signing configuration. Authentication/account/TOTP verification happens before the checks. A missing readinessProbe document is not an error: read authorization/connectivity is the check. This does not prove write permissions, uploads, backups, TTL activation, distributed contention handling, recovery, real orders or provider availability. It is on-demand diagnostics, not scheduled external monitoring. An external monitor currently cannot call it without the admin session; do not weaken authentication or publish secrets to make that work.

## Isolated verification

The postbuild API gate starts its own loopback-only production server with Firebase/project/payment overrides forced to unconfigured fixtures. It never exercises live shared-store writes. Playwright's owned web server has the same isolation and no longer silently reuses an existing developer server. PW_REUSE_SERVER=1 is only for an explicitly prepared isolated fixture server. Browser optimized images remain stubbed, so layout checks do not verify actual CDN/image quality or LCP.

Before release, run build (including its 14-check API gate), lint and the desktop/mobile suite. Then separately authorize staging verification of shared-limit contention/replay, failure-closed responses, TTL housekeeping, MFA/CRUD/uploads/audit history, provider test payments, both themes and real images. No production customer records or payments should be used as fixtures.

## Dependency status

Compatible lockfile updates include eslint 10.14.0 and typescript-eslint 8.72.1. The registry still reports 16 moderate affected-package entries overall, six in production dependencies. No high/critical entries were reported in the last completed scan. This is not a vulnerability-free result. The glob/minimatch advisory paths remain in upstream dependency chains; forced major overrides/tooling downgrades were not applied. Review upstream fixes or a separately tested replacement/override before closing the finding.

## Still requires owner/environment work

- Latest theme-stability batch passed build/TypeScript, lint, 14 API checks and all 88 repeated desktop/mobile theme/a11y cases (one worker, no retries/skips). Earlier affected/full-run counts remain in the QA audit. Explicit parallel stress, the unrelated full suite, native devices and actual artwork were not signed off in that batch. Do not substitute fixture results for authenticated staging checks.
- User reports ENQUIRY_SECRET was configured. Its value and Vercel deployment were not inspected. Redeploy/restart after setting it.
- Verify deployed client rules/IAM, least privilege, backups/PITR and an actual restore rehearsal. Rotate any previously exposed secrets.
- Configure the two temporary TTL policies and billing alerts, then measure shared-protection latency/cost.
- Approve customer-data retention/privacy and a trusted lost-authenticator recovery procedure.
- Keep live Razorpay blocked until stock reservation, capture reconciliation, customer contact/delivery, recovery, fulfilment and refunds are implemented and tested.
- CSP nonces/provider compatibility, backend pagination/scale and scheduled readiness alerting remain separate work.
