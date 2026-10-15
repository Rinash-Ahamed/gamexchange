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

Copy `.env.example` to `.env.local` and replace every placeholder before production:

```text
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace-with-a-long-unique-password
ADMIN_SESSION_SECRET=replace-with-at-least-32-random-characters
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-firebase-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nreplace-with-your-private-key\n-----END PRIVATE KEY-----\n"
```

Local development falls back to the temporary login credentials shown on the login page when admin environment variables are absent. Production has no login fallback. Firebase credentials are always required before pages that use inventory or service data can load. See `FIREBASE_SETUP.md` for the complete setup, named database, and Application Default Credentials options.

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

- Admin sessions are signed, HTTP-only, same-site cookies with an eight-hour lifetime. Change the development login before sharing the application.
- Set `ENQUIRY_SECRET` (long random string) in production; it signs the single-use enquiry tokens. Without it a per-process fallback is used, so tokens won't survive restarts or multiple instances.
- Rate limits are in-memory per server process. For multiple instances, back them with a shared store (e.g. Redis).
- The CSP still allows `script-src 'unsafe-inline'` (theme boot script, JSON-LD, Next inline scripts). Development also allows `unsafe-eval` for React and Turbopack debugging; production does not. Moving inline scripts to nonces is a known follow-up.
- Enquiries are not stored: they end as a pre-filled WhatsApp message the customer sends.

## Brand assets

- Logo: `public/brand/` (full logo + mark). Icons: `public/icons/` (16–512 px, maskable 192/512), `src/app/icon.png`, `apple-icon.png`, `favicon.ico`, and `src/app/manifest.ts`.

## Checks

`npm run typecheck`, `npm run lint`, `npm run build`, `npm run test:e2e` (set `PW_CHROMIUM_PATH` to use a system Chromium). Specs: site, theme, cta, security, a11y (axe).
