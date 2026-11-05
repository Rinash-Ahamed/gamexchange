# Repair callbacks, phone validation and Turnstile

Implemented 5 November 2026. No deployment, live Firebase write, provider configuration or actual callback performed.

## Repair callback option

Repair > How would you like to contact us? offers the existing Send on WhatsApp flow and Request a callback. Callback uses the same required device/issues/contact details, an unchecked explicit save-and-call consent, and the existing optional branch. It does not promise a booking or callback time. Preferred contact is fixed to Phone call for callback requests.

Only callback submissions save a private `serviceRecords` document. The server requires working configured Firebase, validates the full payload and consent, and applies the existing same-origin, bounded body, signed single-use token, honeypot and shared IP/global/normalized-phone limits. The record uses status received, zero unquoted estimated cost, saved device/issues/customer/phone/branch, source website-callback and a server consent timestamp. Zero is not a repair quote. No new client Firestore writes or public record-reading endpoint is provided. The audit actor website:repair-callback identifies public intake, not an authenticated administrator.

The browser retains a stable UUID for unchanged in-form retries. A transaction creates the ticket once; a server HMAC fingerprint verifies duplicate UUID requests match the same normalized details, without returning any stored customer fields. Turnstile token changes do not change the request identity. Refresh/new enquiry generates a new identity; this is not a permanent cross-device deduplication or phone ownership check. Rate limits still apply to retries. Uncertain writes return no success claim; retry unchanged details in the same form. Directly contact the team if the rate limit or connection prevents recovery.

Success is shown only after persistence succeeds and includes a ticket reference, without requiring WhatsApp. Admin > Service records shows Callback requested, preferred branch, device/issues and a Call customer phone link. Existing admin status/notes/estimate management and confirmation dialogs remain. Unauthenticated users cannot view or manage the saved request. Normal WhatsApp repairs and contact enquiries retain their existing message-link flow; they are not silently stored. No callback email notification, call automation, admin push subscription or callback-specific lifecycle has been added. Staff must check Admin service records.

Phone validation is shared client/server: a ten-digit Indian mobile starting 6-9, optional +91/91 prefix, spaces/hyphens accepted and normalized to ten digits, raw input capped at 24 characters. Field feedback appears on blur and submission in Contact/Repair and the other forms sharing ContactBlock. This validates syntax only, not ownership or whether a number is reachable.

## Cloudflare Turnstile setup

Create a Turnstile widget in Cloudflare using Managed mode. Authorize the actual deployed hostnames in its hostname settings. Add both keys together:

```dotenv
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-public-site-key
TURNSTILE_SECRET_KEY=your-server-only-secret
```

Manage allowed hostnames in Cloudflare only, without protocol, path or port. Authorize localhost there when testing locally; use separate testing credentials/host restrictions for staging as appropriate. The old TURNSTILE_ALLOWED_HOSTNAMES application variable is no longer read and may be removed from local/hosting environments. Never put a real secret in NEXT_PUBLIC_ variables, screenshots, chat or Git. Rebuild/redeploy for public site-key changes; restart locally. No Cloudflare account changes were made by this implementation.

Both keys blank leaves existing forms operational with the existing protections, but **Turnstile is not enabled**. Once either key is set, a missing companion key fails closed for Contact and Repair rather than bypassing verification. Configure them together before deploying. Exchange/Game Zone flows are unchanged. When enabled, both Repair WhatsApp and callback paths require verification.

The compact widget fits narrow form layouts, follows the website's data-theme, cleans up on unmount, and loads Cloudflare's script only when either protected form is mounted. No extra package was installed. CSP allows only the exact Cloudflare challenge script/frame origin. Server verification posts only secret and challenge token to the fixed Siteverify endpoint, uses no-store with a six-second timeout and requires genuine success and matching form action. Domain restrictions rely on the widget's Cloudflare settings, not a second application allowlist. Challenge failures/outages do not save a callback or create a WhatsApp success. Existing rate limits and form tokens remain in place.

Challenge tokens are single-use and expire. After a completed submission attempt the widget remounts for a fresh token; an internal too-fast form-token retry happens before Turnstile verification and retains the unconsumed challenge. Expired/error widgets clear their hidden token and offer retry. Tokens and secret/provider response bodies are not stored with records or logged. The public privacy policy describes callback storage and configured Turnstile use.

## Verification limits

Source/whitespace reviewed only. Build, lint, type checks, regression tests and browser/provider/Firestore/MFA flows were not run, following the explicit-run convention. Added regression source for phone normalization/rejection, callback consent/default behavior, strict Turnstile success/action checks without an application hostname list, backend guard ordering and a mocked saved-reference browser flow. Mocked success is not proof of actual persistence or challenge acceptance.

Before enabling: run the requested checks; verify real-widget contact/repair submissions on authorized domains, missing/forged/expired/replayed/wrong-action/wrong-host tokens, key mismatch/provider timeout and narrow/mobile light/dark layouts. Verify callback appears under an approved MFA admin, repeat unchanged UUID after a simulated lost response creates one ticket, Firebase failure never shows saved, and WhatsApp default remains unchanged. Use sample data. Do not claim Cloudflare protection is active until keys/deployment and server verification are verified.

Official references reviewed: [client rendering](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/), [mandatory server verification and token lifecycle](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/), [CSP requirements](https://developers.cloudflare.com/turnstile/reference/content-security-policy/).
