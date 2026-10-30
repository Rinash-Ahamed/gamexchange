# Architecture review

Date: 2026-10-30

## Scope and limits

Source review of the Next.js application shell, storefront filtering, admin actions and authorization, Firestore initialization/transactions, image upload and serving, caching, enquiry protection, and build verification. This is not an exhaustive penetration test, dependency vulnerability audit, browser performance trace or production infrastructure review. Environment secrets and customer records were not inspected. No Firebase writes, provider changes or deployment were performed during this review.

## Minor gaps fixed

- Guarded the category array lookup during rename. Strict TypeScript compilation caught the possibly missing element.
- Added a shared streaming request-body reader. Enquiry and admin-session JSON parsing now enforce byte limits even when Content-Length is missing or false. UTF-8 bytes, not JavaScript character counts, determine the limit.
- Made token errors and honeypot responses explicitly no-store; added Retry-After to throttled admin-session responses.
- Bounded the process-local rate-limit registry to 10,000 active keys. At capacity, new keys fail closed until expired entries can be removed; active limits are not evicted to make room.
- Replaced incomplete radio semantics on platform chips with accessible pressed buttons. Preserved standard keyboard activation.
- Marked nested filter/sidebar scrollers for the existing native-scroll exception. Removed absolutely positioned admin footer controls so they do not overlap navigation on short desktop viewports.
- Added no-index metadata to protected admin routes and a recoverable application error screen that does not display server exceptions or customer details.
- Updated stale security-test contact data and storefront button selectors. These browser tests were edited, not executed in this review.

## Automatic build gate

Subsequent cart work expanded this gate from eight to 12 checks, adding checkout guards. See `RAZORPAY_SETUP.md` for the current scope. The original eight checks below remain included.

`npm run build` runs `next build`, then npm's `postbuild` lifecycle invokes `scripts/check-api-health.mjs`. A failing build does not reach the check; a failing check makes the overall command fail. Calling `next build` directly bypasses npm lifecycle scripts, so CI/hosting should use `npm run build`.

The script starts its own production server on an ephemeral loopback port, checks the compiled API routes, and stops that server. It does not reuse or stop an existing development server. Run `npm run healthcheck` to repeat against the existing build.

Eight checks cover liveness, security/cache headers, origin guards, token issuance, unsigned enquiry rejection, declared body limits, chunked UTF-8 body limits and cross-origin admin-session rejection. No valid customer submission, sign-in, inventory initialization, Firestore access or Storage request is made. `/api/health` is intentionally a cheap process-liveness endpoint, not proof that external providers are healthy. It returns only a static service/status response with no-store caching.

## Major follow-ups requiring decisions

| Priority | Finding and source evidence | Recommended next step, not implemented |
| --- | --- | --- |
| Before production | `src/lib/admin/db.ts` still initializes demo inventory on the first read of an empty, uninitialized database. This is persistent, deliberate existing behavior, not a scheduled deletion. It can publish sample stock in a fresh production project. | Make demo import an explicit admin/setup action, and make public reads strictly read-only. Confirm the desired first-install behavior before changing it. Preserve existing stock and initialization markers. |
| Before production | Backup, point-in-time recovery, Storage versioning, retention and restore procedures cannot be established from this repository. Immediate image cleanup on replacement is implemented. No statement about live backups is verified. | Review the actual Firestore/Storage settings and costs, enable the agreed recovery policy, and perform a restore exercise. Keeping data persistently is not a substitute for backups. |
| Before multiple instances | `src/lib/security.ts` holds token replay state in a process Map and falls back to a random process secret. `src/lib/rate-limit.ts` is process-local. Client IP identification depends on the deployment proxy's treatment of forwarded headers. | Configure a stable ENQUIRY_SECRET, choose a shared atomic limiter/replay store, and document trusted proxy headers. A shared secret alone does not make replay protection global. |
| Before public launch | The privacy policy is still an approved-to-draft-only artifact, not approved for publication. `next.config.ts` allows inline scripts in production; it does not allow unsafe-eval there. | Obtain business approval for privacy wording. Plan nonce-based CSP separately because it affects rendering/caching. Do not blindly remove inline allowances and break Next.js hydration. |
| As stock/records grow | Public catalogue filtering receives the complete catalogue; `listInventory`, `listServiceRecords` and category usage/deletion checks can read full collections. Showing 24 cards limits DOM work, not database reads or transferred data. | Introduce cursor pagination and indexed server-side queries/search after agreeing filter semantics and measuring actual collection sizes. Do not silently truncate records or show misleading counts. |
| With multiple administrators | Inventory updates are atomic for SKU uniqueness but do not check a submitted record revision. Record changes have timestamps, not an immutable administrator audit history. | Add optimistic concurrency and a server-written audit trail with explicit retention. This changes stored data and admin conflict handling. |

## Strengths retained

Server-only Firebase credentials; verified-email, UID-allowlisted TOTP sessions; revocation/account checks; authorization on every mutating server action; schema validation; transactional SKU/category handling; confirmation dialogs; bounded image-byte caches; visibility checks outside byte caches; versioned uploaded images; public-data invalidation after saves; shared theme tokens and reduced-motion support. None of these establishes live infrastructure compliance without deployment verification.

## Verification

- Initial lint passed.
- Initial build exposed the category rename type error, which was corrected.
- Subsequent production build passed TypeScript, static generation and all eight automatic API checks.
- Final lint/build results are recorded in SESSION.md after the last code changes.
- Full Playwright, manual desktop/mobile/theme checks, live MFA/upload/cache invalidation, external dependency readiness, backups and production timings were not verified. No FPS, latency or Core Web Vitals improvements are claimed.
