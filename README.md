# GamexChange

Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind 4 · Motion · Zod.

## Run
```
npm install
npm run dev          # http://localhost:3000
npm run typecheck && npm run lint && npm run build
npx playwright install chromium && npm run test:e2e
```

## Admin dashboard

The protected admin area is available at `/admin/login`. It manages live storefront inventory and private customer service records in Cloud Firestore through the server-only Firebase Admin SDK.

Homepage promotions are managed at `/admin/banners`. Set `FIREBASE_STORAGE_BUCKET` for image uploads. Admins can preview, reorder, save drafts, publish up to five slides and replace or delete images. Upload requirements are shown in the editor. See the banner upload section of `FIREBASE_SETUP.md` for Storage setup and artwork sizes.

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
- Forms never claim a booking. Success means "ready to send on WhatsApp".
- Product images load from the existing site's CDN (`framerusercontent.com`); self-host them before decommissioning the old site.
- FAQ answers and warranty terms were not published on the old site. Review `src/data/faq.ts`.

## Environment & security notes

- Admin sessions are Firebase-issued, HTTP-only, same-site cookies with an eight-hour lifetime. Server checks enforce the UID allowlist, verified email, TOTP authentication and enrollment, account status, and revocation. Legacy environment passwords are no longer accepted.
- Set `ENQUIRY_SECRET` (long random string) in production; it signs the single-use enquiry tokens. Without it a per-process fallback is used, so tokens won't survive restarts or multiple instances.
- Rate limits are in-memory per server process. For multiple instances, back them with a shared store (e.g. Redis).
- The CSP still allows `script-src 'unsafe-inline'` (theme boot script, JSON-LD, Next inline scripts). Development also allows `unsafe-eval` for React and Turbopack debugging; production does not. Moving inline scripts to nonces is a known follow-up.
- Enquiries are not stored: they end as a pre-filled WhatsApp message the customer sends.

## Brand assets

- Logo: `public/brand/` (full logo + mark). Icons: `public/icons/` (16–512 px, maskable 192/512), `src/app/icon.png`, `apple-icon.png`, `favicon.ico`, and `src/app/manifest.ts`.

## Checks

`npm run typecheck`, `npm run lint`, `npm run build`, `npm run test:e2e` (set `PW_CHROMIUM_PATH` to use a system Chromium). Specs: site, theme, cta, security, a11y (axe).
