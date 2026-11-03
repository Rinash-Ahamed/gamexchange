# GameXchange

## Project documentation

- [Session context and current work](SESSION.md): read first when continuing development.
- [Firebase setup](FIREBASE_SETUP.md): authentication, database, Storage and upload requirements.
- [Performance audit](PERFORMANCE_AUDIT.md): applied optimizations, verification limits and follow-up measurements.
- [Architecture review](ARCHITECTURE_REVIEW.md): minor fixes, build health gate and major production decisions.
- [QA and security audit, 2026-11-03](QA_SECURITY_AUDIT_2026-11-03.md): findings, local test results, priorities and live-provider verification limits.
- [Security operations](SECURITY_OPERATIONS.md): shared protection, temporary TTL setup, admin history, readiness and release checks.
- [Cart and Razorpay test setup](RAZORPAY_SETUP.md): test keys, webhook configuration, verification and live-payment limits.
- [Gmail notification setup](EMAIL_SETUP.md): App Password and planned server-only mail settings; sending integration is still pending.
- [Privacy policy publication record](PRIVACY_POLICY.md): public policy, checkout consent behavior and remaining business/legal checks.

These documents live in `.agent/`. Source paths and commands below are relative to the repository root, not this directory. The root [AGENTS.md](../AGENTS.md) directs coding agents here.

Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind 4 · Motion · Zod.

## Run
```
npm install
npm run dev          # http://localhost:3000
npm run typecheck && npm run lint && npm run build
npm run healthcheck  # repeat API checks against the existing production build
npx playwright install chromium && npm run test:e2e
```

## Admin dashboard

The protected admin area is available at `/admin/login`. It manages live storefront inventory and private customer service records in Cloud Firestore through the server-only Firebase Admin SDK.

Use `/admin/categories` to add or rename shop categories and delete unused ones. Inventory uses a required category dropdown. Existing category names are imported automatically; renames follow linked products. Categories with products cannot be deleted until those products are reassigned. Public shop filters include only categories with active, in-stock products.

In `/admin/inventory`, search by product name or SKU and combine category, platform, status and stock filters. Select **Apply filters** to update the list or **Clear filters** to reset it. Filter selections are stored in the page URL; saving or deleting a product returns to the unfiltered list.

The public shop groups stock into Games, Consoles and Accessories, with platform chips, search and price/condition/category/game-detail filters. Admin inventory includes the matching shop section, optional genre/format/edition/details and genuine-discount pricing fields. Existing Firebase image uploads support uncropped portrait covers and hardware photos. PC components are not a public shop offering. See the shop browsing section of `FIREBASE_SETUP.md` for legacy-data behaviour.

Shop browsing uses numbered pagination with 20 products per page, Previous/Next, first/last page links, bounded ellipses and exact result ranges. Filter/sort changes reset page 1; page changes retain filters and return focus/scroll to the results, respecting reduced motion. Pagination currently limits rendered cards, not the underlying Firestore query or catalogue payload; cursor-based backend pagination remains a separate scalability follow-up. Page/filter state is client-local, not stored in the URL.

Shop cards use a compact responsive grid: two columns on mobile, three to four on laptops and five on wide desktops. Homepage showcase sizes stay unchanged. Cards open `/products/[id]`; cart and enquiry actions remain separate. Detail pages show uncropped inventory artwork, saved prices/discounts, condition, supplied descriptions/metadata and cart actions. Related active stock is labelled More to explore, not purchase-history recommendations. Public visibility uses the same catalogue boundary as the shop. Missing/unpublished stock is unavailable, and inventory/category saves invalidate detail routes.

Inventory supports up to five ordered photos, with cover selection, preview, earlier/later controls and staged removal in the existing confirmed editor. Existing single-image items remain compatible. New uploads accept static JPG/PNG/WebP, 300 to 4096 px per side, up to 4 MB combined per save; no new environment variables are needed. The first image remains the shop/home/cart cover; `/products/[id]` adds an uncropped thumbnail gallery. See FIREBASE_SETUP.md for byte limits, ownership/version checks and safe cleanup behavior.

The consumer sidebar keeps sort, price inputs/sliders, condition, platforms and discounted-only choices. Categories appear when there are multiple subcategories, hardware brand when supplied, and game genre/format/player modes/age rating/release year only when stocked products provide the data. Edition/model remains searchable and visible on cards but is not a separate default filter. The minimum-discount dropdown was removed as redundant clutter; biggest-discount sorting remains. Optional inventory metadata is preserved. Selected facets remain removable even with no matching products. No fake stock, gameplay-hour guesses, preorder or PC-component offerings are added.

Visitors can collect multiple products at `/cart`, change quantities, sign in with Google and enter Indian delivery details before Razorpay checkout. Cart checkout no longer links to WhatsApp. Enable the Firebase Google provider and authorized domains as described in FIREBASE_SETUP.md. Razorpay checkout is test-only and needs the three server environment values in `RAZORPAY_SETUP.md`. Admin > Test orders shows sandbox records with customer email and delivery details. Live keys are blocked; simulated orders do not change stock or create deliveries. Shipping rates, courier serviceability and finance email delivery are not implemented.

Homepage promotions are managed at `/admin/banners`. Set `FIREBASE_STORAGE_BUCKET` for image uploads. Admins can preview, reorder, save drafts, publish up to five slides and replace or delete images. Upload requirements are shown in the editor. See the banner upload section of `FIREBASE_SETUP.md` for Storage setup and artwork sizes.

Homepage also has Service images at `/admin/homepage-services` and Game Zone images at `/admin/homepage-gamezone`. These manage backgrounds for the six existing service cards and three homepage rate cards, with upload previews, confirmed publication and restoration of bundled originals. They use the existing Storage bucket and `settings/homepageImages`. Requirements: 1200 x 900 px recommended, static JPG/PNG/WebP up to 5 MB, 300 to 4096 px per side. Titles, links and rates are not edited here.

The admin navigation groups **Banners** and **FAQs** under **Homepage**. Use `/admin/faqs` to manage question text, answers, display order and draft/published visibility. Existing FAQ content is copied into Firestore on the first admin visit; later edits are saved there and published questions appear on subsequent homepage visits or refreshes.

Copy `.env.example` to `.env.local` and replace every placeholder before production:

```text
FIREBASE_ADMIN_UIDS=your-admin-firebase-auth-uid
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-web-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-web-app-id
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-firebase-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nreplace-with-your-private-key\n-----END PRIVATE KEY-----\n"
```

Admin login requires Firebase Authentication with Identity Platform, a verified email, mandatory TOTP, and an approved Firebase Auth UID. There is no development or password-only bypass. Follow `FIREBASE_SETUP.md` for enabling TOTP, first-time enrollment, recovery, named databases, and Application Default Credentials. Until `FIREBASE_PROJECT_ID` is configured, public product pages use the local demo catalog in `src/data/products.ts` and log a warning; admin inventory and service-record pages require a working Firestore connection. Once a project ID is set, Firestore credential or connection errors remain visible.

## Where to connect things later
| What | Where |
|---|---|
| Business facts (phones, hours, branches, WhatsApp, social, sell form) | `src/data/site.ts` |
| Products, prices, trade-in figures, images | `src/data/products.ts` |
| Game zone stations and rates | `src/data/gamezone.ts` |
| Repair devices/faults, exchange options | `src/data/repair.ts` |
| Reviews, FAQ | `src/data/reviews.ts`, `src/data/faq.ts` |
| Enquiry delivery (currently pre-filled WhatsApp message) | `src/app/api/enquiry/route.ts` |
| Rate limiting (in-memory; swap for Redis/Upstash when multi-instance) | `src/lib/rate-limit.ts` |
| Theme tokens (dark + light) | `src/app/globals.css` |

The default theme follows the visitor's local time: light from 6:00 AM through 5:59 PM and dark from 6:00 PM through 5:59 AM. The navigation toggle stores an explicit light or dark preference that overrides the schedule.

## Notes

- `/franchise` has a top-section click-to-play video and a streamed managed photo gallery. Admin > Homepage > Franchise photos manages photos with city, state, locality, description, order and draft/published status using the existing Firebase bucket. Defaults remain under `public/franchise/` and `src/data/franchise.ts`; the supplied illustrated map/location list stays separate and static. Enquiry opens a WhatsApp draft. See FIREBASE_SETUP.md for initialization, upload and caching limits. Contact branches, financial terms and map coordinates are not inferred from photo entries.

- Forms never claim a booking. Success means "ready to send on WhatsApp".
- Product images load from the existing site's CDN (`framerusercontent.com`); self-host them before decommissioning the old site.
- FAQs and legal policies now come from the supplied `GXC Concepts Website Content.docx`, with grammar/formatting edits. FAQ purchase and sell instructions match the current enquiry workflow rather than advertising unimplemented cart, checkout or PIN-code tools.
- Public legal routes: `/terms`, `/policies` and `/policies/[slug]`. Shared content lives in `src/data/legal.ts`; privacy content is in `src/data/privacy-policy.ts`, published at `/policies/privacy-policy` at the owner's request. It is linked in the footer, policy directory, sitemap and required checkout consent. The legacy protected `/admin/privacy-preview` redirects to the public page. Publication does not imply legal review or live-payment readiness. See `.agent/PRIVACY_POLICY.md`.

## Environment & security notes

Visible website/admin copy should describe tasks and outcomes, not deployment, Firebase, bucket permissions, environment variables or raw JSON diagnostics. Keep technical setup, troubleshooting and verification limits in .agent documents. Keep concise upload requirements, actionable validation, authenticator guidance, unapproved-policy notices and honest test-payment/no-delivery warnings in the interface. Do not imply production payments, legal approval or full service readiness merely to simplify copy. Admin Activity uses readable field labels and before/after lists; the underlying audit data and private readiness API remain intact.

Shared implementation helpers:

- `src/components/seo/JsonLd.tsx`: server-only native application/ld+json data blocks, using the shared escaping serializer. Do not use next/script or beforeInteractive for JSON-LD: those strategies are for executable JavaScript, and the bootstrap wrapper can trigger React's client-rendered-script warning. Razorpay still uses next/script for its actual JavaScript SDK. See https://nextjs.org/docs/app/guides/json-ld.

- `src/lib/admin/form-data.ts`: allowlisted form text fields and optional file extraction.
- `src/lib/admin/revalidate.ts`: resource-specific route and public-cache invalidation after successful admin mutations.
- `src/lib/firebase/firestore.ts` and `storage.ts`: server-only database and bucket access, sharing the existing Firebase Admin app.
- `src/lib/byte-cache.ts`: bounded immutable-byte LRU with concurrent-download coalescing. It must never cache admin authorization or image visibility.

- Admin sessions are Firebase-issued, HTTP-only, same-site cookies with an eight-hour maximum and a server-enforced 15-minute idle timeout. The admin UI warns one minute before expiry, offers Stay signed in and synchronizes activity across tabs. Background requests do not extend the deadline. Firestore adminSessions stores per-cookie hashed session IDs, UID and timing metadata, not bearer tokens. Existing sessions without tracking records must sign in again. Server checks still enforce the UID allowlist, verified email, TOTP authentication and enrollment, account status, and revocation. Legacy environment passwords are no longer accepted.
- Set `ENQUIRY_SECRET` (long random string) in production; it signs the single-use enquiry tokens. Without it a per-process fallback is used, so tokens won't survive restarts or multiple instances.
- Configured Firebase deployments use atomic Firestore rate limits and nonce consumption. Strong ENQUIRY_SECRET is required; shared-store failures fail closed. Unconfigured fixtures use bounded memory. Configure expiresAt TTL only for securityRateLimits/securityTokenUses; see SECURITY_OPERATIONS.md for costs, limits and staging checks.
- The CSP still allows `script-src 'unsafe-inline'` (theme boot script, JSON-LD, Next inline scripts). Development also allows `unsafe-eval` for React and Turbopack debugging; production does not. Moving inline scripts to nonces is a known follow-up.
- Enquiries are not stored: they end as a pre-filled WhatsApp message the customer sends.

## Brand assets

- Logo: `public/brand/` (full logo + mark). Icons: `public/icons/` (16–512 px, maskable 192/512), `src/app/icon.png`, `apple-icon.png`, `favicon.ico`, and `src/app/manifest.ts`.

## Checks

Image loading is explicit through `src/lib/image-loading.ts`: critical = eager/high fetch priority, visible = eager, deferred = lazy. Choose by layout role, not client-only viewport branches during hydration. ESLint requires this policy on imported Next Image elements and disallows competing loading/priority/preload overrides. The primary hero and first shop product are critical, likely above-fold rows are eager, and lower content remains deferred. Banner slides are eager whenever mounted: the first is present in server HTML; remaining slides mount near the banner. Do not eagerly mount every below-fold image just to silence a warning. Existing page regression checks now include LCP/priority-loading console warnings; `tests/e2e/image-loading.spec.ts` covers the policy and banner transitions. Browser checks are still needed after layout or artwork changes because the actual LCP candidate depends on the viewport and content.

Use `npm run build` in CI/hosting. Its postbuild step starts an isolated loopback production server with live Firebase/payments disabled and runs 14 fixture API/import checks, including checkout and anonymous readiness guards. A health-check failure fails the command. `/api/health` reports process liveness only; protected `/admin/health` and `/api/admin/readiness` add on-demand read-only dependency checks. Neither proves live payment readiness. Direct `next build` does not run npm lifecycle hooks. See `SECURITY_OPERATIONS.md` and `RAZORPAY_SETUP.md` for scope and limits.

Node is pinned to 24.x. Deploy both package.json and package-lock.json. A scoped Firebase Admin > jwks-rsa > jose 5.10.0 override avoids the upstream CommonJS require of ESM-only jose 6 during server startup; do not edit node_modules manually. Postbuild includes a credential-free Firebase Admin import check with require(ESM) disabled. This import gate does not verify remote credentials, MFA or Firestore/Storage access. Revisit the compatibility override when upstream resolves the module-loading issue.

`npm run typecheck`, `npm run lint`, `npm run build`, `npm run test:e2e` (set `PW_CHROMIUM_PATH` to use a system Chromium). Specs: site, theme, cta, security, a11y (axe).

Browser validation defaults to one worker because concurrent clock/paint/axe runs were unstable on this workstation. Use explicit --workers only for separately reported concurrency stress runs; do not silently treat those as equivalent to the deterministic acceptance run. Theme startup tests wait for the non-DOM bootstrap completion signal keyed by Symbol.for("gamexchange.theme.initialized"), independent of mocked Performance entries. Accessibility checks wait for fonts and finite entrance animations, without disabling infinite decoration or contrast assertions. See QA_SECURITY_AUDIT_2026-11-03.md for evidence and verification limits.
