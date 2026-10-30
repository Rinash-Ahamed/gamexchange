# GamexChange

## Project documentation

- [Session context and current work](SESSION.md): read first when continuing development.
- [Firebase setup](FIREBASE_SETUP.md): authentication, database, Storage and upload requirements.
- [Performance audit](PERFORMANCE_AUDIT.md): applied optimizations, verification limits and follow-up measurements.
- [Architecture review](ARCHITECTURE_REVIEW.md): minor fixes, build health gate and major production decisions.
- [Cart and Razorpay test setup](RAZORPAY_SETUP.md): test keys, webhook configuration, verification and live-payment limits.
- [Privacy policy draft](PRIVACY_POLICY_DRAFT.md): proposed wording and business/legal checks required before publication.

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

The consumer sidebar keeps sort, price inputs/sliders, condition, platforms and discounted-only choices. Categories appear when there are multiple subcategories, hardware brand when supplied, and game genre/format/player modes/age rating/release year only when stocked products provide the data. Edition/model remains searchable and visible on cards but is not a separate default filter. The minimum-discount dropdown was removed as redundant clutter; biggest-discount sorting remains. Optional inventory metadata is preserved. Selected facets remain removable even with no matching products. No fake stock, gameplay-hour guesses, preorder or PC-component offerings are added.

Visitors can collect multiple products at `/cart`, change quantities and send one combined WhatsApp enquiry. Razorpay checkout is test-only and needs the three server environment values in `RAZORPAY_SETUP.md`. Admin > Test orders shows sandbox records. Live keys are blocked; simulated orders do not change stock or create deliveries.

Homepage promotions are managed at `/admin/banners`. Set `FIREBASE_STORAGE_BUCKET` for image uploads. Admins can preview, reorder, save drafts, publish up to five slides and replace or delete images. Upload requirements are shown in the editor. See the banner upload section of `FIREBASE_SETUP.md` for Storage setup and artwork sizes.

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

- `/franchise` is a dedicated public franchise page, linked from the homepage service card and footer. Supplied store photos and a cropped locations-only map are optimized under `public/franchise/`; captions and accessible location text live in `src/data/franchise.ts`. Enquiry opens a draft WhatsApp message without automatic submission. Fees, profitability, territory availability and support packages are not invented. This page does not change the separate contact branch registry.

- Forms never claim a booking. Success means "ready to send on WhatsApp".
- Product images load from the existing site's CDN (`framerusercontent.com`); self-host them before decommissioning the old site.
- FAQs and legal policies now come from the supplied `GXC Concepts Website Content.docx`, with grammar/formatting edits. FAQ purchase and sell instructions match the current enquiry workflow rather than advertising unimplemented cart, checkout or PIN-code tools.
- Public legal routes: `/terms`, `/policies` and `/policies/[slug]`. Shared content lives in `src/data/legal.ts`. The source contains no privacy policy; its separately drafted replacement is available for review at the protected `/admin/privacy-preview` route and in `.agent/PRIVACY_POLICY_DRAFT.md`, not public navigation or the sitemap.

## Environment & security notes

Shared implementation helpers:

- `src/lib/admin/form-data.ts`: allowlisted form text fields and optional file extraction.
- `src/lib/admin/revalidate.ts`: resource-specific route and public-cache invalidation after successful admin mutations.
- `src/lib/firebase/firestore.ts` and `storage.ts`: server-only database and bucket access, sharing the existing Firebase Admin app.
- `src/lib/byte-cache.ts`: bounded immutable-byte LRU with concurrent-download coalescing. It must never cache admin authorization or image visibility.

- Admin sessions are Firebase-issued, HTTP-only, same-site cookies with an eight-hour lifetime. Server checks enforce the UID allowlist, verified email, TOTP authentication and enrollment, account status, and revocation. Legacy environment passwords are no longer accepted.
- Set `ENQUIRY_SECRET` (long random string) in production; it signs the single-use enquiry tokens. Without it a per-process fallback is used, so tokens won't survive restarts or multiple instances.
- Rate limits are in-memory per server process. For multiple instances, back them with a shared store (e.g. Redis).
- The CSP still allows `script-src 'unsafe-inline'` (theme boot script, JSON-LD, Next inline scripts). Development also allows `unsafe-eval` for React and Turbopack debugging; production does not. Moving inline scripts to nonces is a known follow-up.
- Enquiries are not stored: they end as a pre-filled WhatsApp message the customer sends.

## Brand assets

- Logo: `public/brand/` (full logo + mark). Icons: `public/icons/` (16–512 px, maskable 192/512), `src/app/icon.png`, `apple-icon.png`, `favicon.ico`, and `src/app/manifest.ts`.

## Checks

Image loading is explicit through `src/lib/image-loading.ts`: critical = eager/high fetch priority, visible = eager, deferred = lazy. Choose by layout role, not client-only viewport branches during hydration. ESLint requires this policy on imported Next Image elements and disallows competing loading/priority/preload overrides. The primary hero and first shop product are critical, likely above-fold rows are eager, and lower content remains deferred. Banner slides are eager whenever mounted: the first is present in server HTML; remaining slides mount near the banner. Do not eagerly mount every below-fold image just to silence a warning. Existing page regression checks now include LCP/priority-loading console warnings; `tests/e2e/image-loading.spec.ts` covers the policy and banner transitions. Browser checks are still needed after layout or artwork changes because the actual LCP candidate depends on the viewport and content.

Use `npm run build` in CI/hosting. Its postbuild step starts an isolated loopback production server and runs 12 non-mutating API smoke checks, including checkout guards. A health-check failure fails the command. `/api/health` reports process liveness only, not Firebase/Auth/Storage/Razorpay connectivity. Direct `next build` does not run npm lifecycle hooks. See `ARCHITECTURE_REVIEW.md` and `RAZORPAY_SETUP.md` for scope and limits.

`npm run typecheck`, `npm run lint`, `npm run build`, `npm run test:e2e` (set `PW_CHROMIUM_PATH` to use a system Chromium). Specs: site, theme, cta, security, a11y (axe).
