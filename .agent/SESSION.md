# Gameexchange Session Notes

This file stores durable context between development sessions. Keep entries concise and update them when project decisions, completed work, blockers, or next steps change.

## Project

- Name: Gameexchange
- Status: Existing application under active development
- Workspace: `C:\Users\rinas\Project\gamexchange`

## Current State

- Admin access uses Firebase Authentication, verified email, a UID allowlist and mandatory TOTP. No development-password bypass exists.
- Inventory and customer service records use Firestore. Banner and stock image uploads use the configured Firebase Storage bucket; never copy credentials from `.env.local` into documentation.
- Inventory supports category-grouped lists, collapsed editors, image previews and confirmation dialogs. Category selection uses a required dropdown managed from `/admin/categories`.
- Categories can be added, renamed and deleted if unused. Stable IDs and legacy-name mapping preserve existing product assignments and follow renames without bulk rewriting product documents. Public shop categories still come only from active, in-stock products.
- Latest UI fix moved the global form font reset into the base cascade layer so utility typography works consistently on buttons and fields.
- Recent inventory-upload and typography work passed typecheck. Live Firebase uploads, build, lint and end-to-end checks have not been verified in these updates.

## Earlier Work

This is historical context. Later entries and the Current State section supersede older implementation descriptions.

- Created this session-notes file for continuity.
- Reviewed the existing application layout and framework structure.
- Applied a global clarity pass and added accessible smooth scrolling.
- Removed em dashes from all project-owned source, copy, metadata, comments, accessibility labels, and documentation.
- Removed downward and outer shadows from buttons and button-like controls.
- Allowed `unsafe-eval` in the development CSP only so React and Turbopack debugging work; production CSP remains unchanged.
- Tightened global page heroes, transition gates, section padding, content gaps, calls to action, product grids, and footer spacing.
- Removed all eyebrow labels and hero grid overlays.
- Added a four-message animated home headline with a moving gradient and removed the hero scroll guide.
- Added local-time theme scheduling (light from 6:00 AM to 5:59 PM, dark from 6:00 PM to 5:59 AM) with seamless boundary updates and persistent manual overrides.
- Allowed Next.js image qualities 75, 80, and 85 to match all current image components.
- Extended the moving gradient animation to every heading that uses gradient text.
- Replaced the old Game Zone CDN photos with four original local PNG gaming visuals.
- Added a protected single-admin login and operations dashboard.
- Added Firestore-backed inventory management and customer service record tracking through the server-only Firebase Admin SDK.
- Connected active, in-stock inventory to the public home shelf and Products page.
- Replaced the static “Heard from the lobby” review grid with a themed, accessible 3D vertical testimonial marquee based on the supplied reference.

## Existing Architecture

- Next.js 16 App Router with React 19, strict TypeScript, Tailwind CSS 4, Motion, and Zod.
- Shared root shell: theme bootstrapping, providers, fixed responsive navigation, page transitions, footer, and structured data.
- Routes: `/`, `/products`, `/exchange`, `/repair-service`, `/game-zone`, and `/contact`.
- API routes: `/api/enquiry` and `/api/enquiry/token`.
- Components are grouped by `layout`, `home`, `shop`, `zone`, `forms`, and reusable `ui` primitives.
- Business content is isolated in `src/data`; shared behavior and security utilities are in `src/lib`.
- Styling uses semantic dark/light theme tokens in `src/app/globals.css` with a blue/violet gaming aesthetic.
- Playwright covers desktop and mobile behavior, accessibility, security, calls to action, and theme behavior.

## Decisions

- Global clarity changes remain token-driven in `globals.css` so all routes inherit them consistently.
- Inertial scrolling runs only for fine pointers when reduced motion is not requested; touch and reduced-motion users retain native scrolling.
- Batch upcoming implementation changes without running lint, build, or tests after each change. Run the full validation suite only when the user explicitly asks for final checks.
- Firebase admin credentials remain server-side. Admin access requires the approved Firebase Auth UID and TOTP; legacy password-based admin access is not supported.
- Operational data uses Cloud Firestore. Firebase Admin credentials stay server-side and are configured through environment variables.
- Inventory SKUs use a transactional Firestore index so duplicate SKUs cannot be created during concurrent requests.
- Destructive admin actions use an accessible themed in-app confirmation dialog instead of the browser confirmation popup.
- The testimonial marquee no longer pauses on hover or focus, and uses a simpler mobile compositor layer to avoid touch-device animation stalls.
- Testimonial cards are display-only, preventing mobile taps from opening Google Maps through short review links.
- The testimonial stage keeps both columns fully visible by removing the edge mask and reducing perspective skew.
- Added Franchise Opportunities to the home service list with a WhatsApp franchise enquiry call to action.
- Added a contact-form enquiry type so franchise messages are clearly labelled for the team.
- Added a console layer behind the controller in the hero, and changed shop browsing to live inventory categories managed from the admin inventory form.
- Made every home service card a full-card link to its appropriate repair, exchange, or contact route.
- Retained the cleaner console-and-controller hero composition after removing the experimental PS5 exploded-module variation.
- Theme changes use a single page-level View Transition instead of transitioning every DOM element, avoiding the previous repaint lag.
- Added a game-style first-session boot screen with a logo power-up, system statuses, progress sequence, accessible interaction locking, and reduced-motion handling.
- Combined theme and boot-session pre-paint logic into one bootstrap script to avoid Next.js client-rendered script warnings.
- Routed all JSON-LD through Next.js Script components so client rendering never encounters raw script elements.
- Moved executable theme and boot startup code into Next.js client instrumentation so React never renders an executable script element.

## Next Steps

- The user reports that the Firebase project, authentication provider, Storage bucket and local environment are configured. Verify the actual upload workflow when requested without exposing environment values. See [Firebase setup](FIREBASE_SETUP.md).
- Verify category initialization, create/rename/delete and dropdown workflows against Firebase when checks are requested. Existing category names are automatically imported on first initialization.
- Keep the legacy SQLite files until any records that matter have been migrated and verified in Firestore.
- Run typecheck, lint, build, and Playwright only when explicitly requested.

## Recent Updates

### 2026-10-30: Testimonial copy polish

- Removed decorative quotation marks from testimonial cards. Corrected spelling, grammar, punctuation, console naming and spacing in the supplied review text at the user's request, preserving customer names and the meaning of each review.
- Kept the existing layout and animation. Source and whitespace reviewed; runtime checks remain deferred.

### 2026-10-30: Hidden-document theme transition error

- Theme changes now skip View Transitions when the document is hidden while still applying the correct scheduled or stored theme.
- Handled ready/updateCallbackDone promise rejection if a visible tab becomes hidden mid-transition. Replaced the unhandled finished.finally chain with success/error cleanup handlers and added a synchronous-start fallback.
- Added Playwright regression cases for hidden-tab storage updates and aborted transition promises. Reviewed source and whitespace; tests, typecheck, lint and build have not been run yet under the requested batched-check workflow.

### 2026-10-30: Supplied customer testimonials

- Replaced the six previous testimonials with 13 customer names and full review texts transcribed from the user-supplied WhatsApp screenshot folder dated 2026-10-30 at 12.33.03 AM.
- Included only customer-authored feedback, excluding owner replies, photos and reaction metadata. Removed source labels, verification claims and star footers from cards so the visible content is the customer name and review.
- Kept the existing display-only marquee, initials, theme styling and motion. Preserved review wording and paragraph breaks, removing surrounding quote/formatting artifacts from screenshots.
- Source and whitespace reviewed. Build, lint, typecheck and browser checks remain deferred until requested.

### 2026-10-30: Inventory search and filters

- Added a compact, responsive GET search form above the grouped inventory list. Search matches product name, SKU, platform, category and condition, with case-insensitive multi-word matching.
- Added combined category, platform, status and stock filters (in stock, low stock 1 to 2, or no stock), plus Apply filters, Clear filters, matching/total counts and a no-results message.
- Extracted pure filtering/grouping and query helpers to `src/lib/admin/inventory-filters.ts`. Filters use URL parameters for refresh/back navigation, preserve original list ordering and operate after the existing authenticated inventory read. No requests are made per keystroke and no Firestore indexes or dependencies were added.
- Existing create/edit/delete and confirmation workflows remain unchanged. Source and whitespace reviewed; build, lint, typecheck, browser and live-data verification remain deferred until requested.

### 2026-10-30: Styled Choose file buttons

- Updated the shared upload style so the actual native Choose file button uses the admin blue/violet gradient, display font, uppercase label, rounded corners and hover treatment, including inventory create/edit and banners.
- Kept native file-input keyboard access and existing upload handlers. Source and whitespace reviewed; runtime checks remain deferred.

### 2026-10-30: Consistent upload controls

- Inventory used the plain input style while banners had custom file-button styling. Both now use `adminFileInputClass` from the shared admin styles module.
- File selection, validation and previews are unchanged. Source and whitespace reviewed; build, lint, typecheck and tests remain deferred.

### 2026-10-30: Shared helpers and code cleanup

- Added explicit-field form helpers in `src/lib/admin/form-data.ts`, used by inventory, service, banner and category actions. Inventory create/edit share field extraction and error handling without hiding authorization.
- Centralized post-mutation cache invalidation and affected routes in `src/lib/admin/revalidate.ts` for inventory, categories, banners and services.
- Shared Firestore connection and Storage bucket selection through `src/lib/firebase/firestore.ts` and `storage.ts`; Firebase credentials remain server-only and caller-specific upload errors remain intact.
- Extracted the duplicated bounded, concurrent-download-aware byte cache to `src/lib/byte-cache.ts`. Banner and inventory caches retain separate 8 MB budgets. Authorization and visibility remain outside the cache and are checked by their image routes.
- Image constraints, validation schemas, confirmation dialogs, UI and existing stored data are unchanged. Reviewed modified source and whitespace; build, lint, typecheck, tests and live workflows remain deferred until requested.

### 2026-10-30: Clean category management

- Added Categories to admin navigation with compact create, collapsed rename, product counts, deletion protection and confirmation dialogs.
- Replaced free-text inventory category input with a required dropdown and Manage categories link. Category IDs are validated inside inventory write transactions.
- Registry is stored at `settings/inventoryCategories`, initialized once from defaults and existing inventory. Original names map old records to stable IDs. Renaming updates displayed labels throughout inventory and the public catalogue without bulk document edits.
- Case/spacing-normalized duplicates are blocked. Categories used by any product, including draft/out-of-stock records, cannot be deleted. Category changes invalidate public product caches and relevant routes.
- Source and whitespace reviewed. Build, lint, typecheck, tests and live Firebase/browser workflows were not run, following the requested batched-check workflow.

### 2026-10-30: Remove inventory trade-in fields

- Removed Trade-in voucher and Trade-in cash inputs from both create and edit inventory forms and from submitted-value validation.
- Existing stored amounts are preserved when editing. New items use zero values for backward compatibility with the current catalogue data model.
- Public trade-in displays and the exchange workflow are unchanged. No build, lint, typecheck or tests were run for this update.

### 2026-10-30: Documentation organization

- Moved the four project Markdown documents into `.agent/`, preserving their contents and existing development notes.
- Added a root `AGENTS.md` entry point and a documentation index in `.agent/README.md`.
- Separated current state, earlier history and recent updates. Corrected obsolete credential and Firebase setup notes, and recorded the category-manager gap.

### 2026-10-30: Consistent admin control typography

- Moved the global form font reset into the base cascade layer so it no longer overrides Tailwind font sizes, weights and families on buttons and fields. This fixes link/button mismatches such as View store and Sign out.
- Banner preview controls and inventory edit toggles now reuse shared admin button styles.

### 2026-10-30: Inventory uploads and simpler banner guidance

- Added stock image uploads and previews using the existing Firebase Storage bucket. Existing images stay unchanged unless a replacement is chosen.
- Server validates and optimizes uploaded images, records dimensions automatically, and cleans up replaced/deleted uploaded objects. Draft image access requires admin authorization.
- Banner page now shows one size/file-limit note, with extra guidance behind More tips.
- TypeScript check passed. Build, lint and live Firebase upload verification were not run in this update.

## Update Template

```md
### YYYY-MM-DD

- Completed:
- Decisions:
- Blockers:
- Next:
```
