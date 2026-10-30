# Gameexchange Session Notes

This file stores durable context between development sessions. Keep entries concise and update them when project decisions, completed work, blockers, or next steps change.

## Project

- Name: Gameexchange
- Status: Existing application under active development
- Workspace: `C:\Users\rinas\Project\gamexchange`

## Current State

- Shop now uses compact responsive cards, public product-detail pages, 20-product numbered client-side pagination and a curated consumer sidebar. These latest changes are source/whitespace reviewed only; they are newer than the successful build/lint run recorded below.

- Cart and Razorpay sandbox checkout are implemented. See `RAZORPAY_SETUP.md` for the three server-only environment values, webhook setup, data handling and recovery limits. Live keys are blocked. Test orders do not reserve/decrement stock or create deliveries. Provider/dashboard configuration and an actual test payment are not verified.

- Architecture review completed on 2026-10-30: see `ARCHITECTURE_REVIEW.md` for scope, fixes and major follow-ups. Latest requested lint and production build passed after the expanded filter, discount and image-loading updates, including TypeScript and all 12 automatic API smoke checks. This does not verify browser layouts, live Firebase/MFA/uploads, backups or production performance.
- `npm run build` now runs the API smoke gate via postbuild; failures fail the command. `npm run healthcheck` repeats it against the existing build. `/api/health` is liveness only. Use npm's build script rather than direct `next build` in CI/hosting.

- Admin access uses Firebase Authentication, verified email, a UID allowlist and mandatory TOTP. No development-password bypass exists.
- Inventory and customer service records use Firestore. Banner and stock image uploads use the configured Firebase Storage bucket; never copy credentials from `.env.local` into documentation.
- Inventory supports category-grouped lists, collapsed editors, image previews and confirmation dialogs. Category selection uses a required dropdown managed from `/admin/categories`.
- Categories can be added, renamed and deleted if unused. Stable IDs and legacy-name mapping preserve existing product assignments and follow renames without bulk rewriting product documents. Public shop categories still come only from active, in-stock products.
- Latest UI fix moved the global form font reset into the base cascade layer so utility typography works consistently on buttons and fields.
- Live Firebase uploads, manual layouts/themes and full end-to-end workflows remain unverified. Latest local build/lint/API results are recorded above and in Recent Updates.

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

### 2026-10-30: Dedicated franchise page with supplied store photos

- Added static `/franchise` in the existing theme with an introduction, six-photo responsive gallery, locations overview, readable location lists and franchise-specific WhatsApp draft enquiries. Homepage franchise card now navigates internally rather than directly to WhatsApp; added a footer link, canonical metadata and sitemap entry. Kept main navigation unchanged.
- Inspected all seven supplied JPEGs from the owner's Downloads/franchisepage folder. Converted photos to metadata-stripped WebP under `public/franchise/`, preserving original aspect ratios and complete photos. Extracted only the geographic map from the poster to avoid publishing its conflicting VR/arcade/12-month-warranty claims. Original source files remain unchanged. Added full-size map access and corresponding text locations; no invented map coordinates or branch phone numbers.
- Location text and photo captions are isolated in `src/data/franchise.ts`. The supplied network includes Coimbatore, Pollachi, Perundurai and Karur; did not change the existing two-branch contact registry or globally claim all facilities at every location. Investment, space and partnership terms require discussion with the team. No Firebase/auth/environment changes, new dependencies or deployment.
- Used the Sites skill's local-only workflow. Added browser regression source; reviewed map asset visually and source/whitespace. Build, lint, tests and browser/responsive/theme verification remain deferred until requested. Earlier Vercel 500 report still needs the deployment URL and sanitized runtime logs; this feature does not establish or fix its cause.

### 2026-10-30: Shop filters without nested scrolling

- Removed the shop sidebar's viewport height cap, internal scrollbar and sticky positioning. Filter option groups also expand to their full content height instead of using individual scroll areas. The entire filter column now moves with normal page scrolling, so lower options stay reachable without nested scroll traps.
- Kept existing collapsible groups, theme tokens, filtering logic and mobile Show/Hide control. No admin filters, inventory data or dependencies changed. Source and whitespace reviewed only; build, lint, tests and browser layouts were not run, per the batched-check convention.

### 2026-10-30: Compact cards and real inventory product details

- Applied the approved compact shop-card treatment: two mobile columns, three to four laptop columns and five wide-desktop columns, smaller uncropped images/spacing and two-line titles. Removed descriptions from listing cards only. Kept homepage showcase sizing intact and existing condition/discount badges visible.
- Added `/products/[id]` with larger contained artwork, saved final/original prices, discount and condition badges, factual optional metadata, inventory description, cart actions and WhatsApp enquiry. Added breadcrumbs, canonical/Open Graph metadata, Product structured data and a helpful unavailable page. Related public stock is labelled More to explore; no fabricated purchase history, product specifications or delivery promises.
- Shop cards open details through a full-card link; Add to cart and Enquire remain separate sibling controls above the link. Homepage image/title links, desktop shelf details and cart names also link to details. Shared helpers handle product URLs and structured-data conditions. Inventory description guidance and inventory/category detail-route invalidation were added. No data migration, Firebase mutation, dependency or environment change.
- Added regression test source for navigation, independent cart controls, detail image loading, overflow, unavailable products and link/condition helpers. Reviewed source and whitespace only. Build, lint, typecheck, tests, responsive/browser/theme checks and live Firebase workflows were not run for this update, per the user's batched-check convention.
- Warned the user to rotate the MFA secret exposed in IDE context wherever it is used. Did not read environment files, repeat/store the secret, rotate credentials or change authentication.

### 2026-10-30: Numbered shop pagination and consumer-focused filters

- Used the user's supplied full sidebar/grid screenshot as an organisational reference, retaining GamexChange styling rather than copying its visual design. Replaced Show more batches with numbered client-side pages of 20, Previous/Next, first/last and adjacent page buttons with ellipses, current-page semantics, exact result ranges and disabled boundary controls. Pagination wraps on narrow screens instead of extending beyond the container.
- Filters/sort changes reset page 1; changing page preserves selections and returns focus/scroll to the result region, respecting reduced motion. Page bounds clamp safely if inventory/results shrink. No timer, dependency, database mutation or per-page network request was introduced. This is rendered-list pagination, not Firestore cursor pagination or a smaller catalogue payload. State remains local to the client, not URL-persistent.
- Curated the consumer sidebar to useful supplied product data: core sorting, price, condition, platforms and on-sale; multiple subcategories and hardware brand where relevant; game genre/format/player modes/age rating/release year where stock has metadata. Removed the standalone edition/model facet and redundant minimum-discount dropdown from the default UI; existing admin metadata/search/cards and filter helper compatibility remain intact. No PC, preorder, gameplay-hours or unsupported online-requirement guesses were added.
- Added pagination/clamping/bounded-link regression source and consumer-facet curation cases; updated shop result-range selectors. Source and whitespace reviewed only. Build, lint, typecheck, tests, browser responsive/keyboard checks and live Firebase verification were not run for this update, following the batched-check convention.

### 2026-10-30: Expanded shop filtering and requested final checks

- Identified why filters looked limited: groups were removed when stock had no matching metadata; platform chips selected only one platform, and admin lacked brand/publisher/player-mode/age-rating/release-year inputs. Earlier reference treatment was organisational only, not a full storefront feature clone.
- Revisited GameNation's public Games/Consoles/Accessories pages with web tools. Live text exposes navigation but not the JavaScript-rendered sidebar. Browser inspection was attempted using the computer-use skill; browser host was unavailable and native Chrome app approval timed out. Did not claim a complete current interactive-sidebar comparison or copy its design.
- Expanded original GamexChange filters with multi-select platforms, standard platform/condition zero counts, collapsible groups and empty metadata explanations, brand/publisher, edition/model, game player modes/age rating/release year, native min/max price sliders, minimum discount and biggest-discount sorting. Counts exclude each facet's own selections while respecting other groups. Unavailable options are disabled unless already selected, so selections can always be removed.
- Added corresponding optional admin metadata, validation and public model fields. Legacy records stay unchanged and missing metadata is never invented. Added canonical condition handling and PS4/PS5 search aliases. No PC components, preorder purchases or unavailable-stock listings were added. Public catalogue cache key bumped; existing save invalidation remains in effect.
- Added source regression cases for metadata combinations, counts, empty groups and discount thresholds. Final `npm.cmd run lint` passed with no warnings/errors. Final `npm.cmd run build` passed compilation, TypeScript, static generation and all 12 automatic API smoke checks, covering the accumulated discount/image changes too. Fixed an unused import caught by the first lint and a strict Zod form-input generic mismatch caught by the first build before rerunning successfully. Diff whitespace check passed. Full browser tests, live Firebase edits and a complete external-sidebar inspection remain unverified.

### 2026-10-30: Banner LCP loading warning and image-policy guardrails

- Read the current Next Image documentation and local LCP observer implementation. PromoSwitch initially rendered its active slide lazy until a viewport callback, then could mark previously visible slides lazy again. Mounted banner slides now always render eager; the first is eager in server HTML, and remaining slides mount near the viewport using a one-time 300 px observer. Auto-rotation remains gated by current visibility, page visibility and reduced motion.
- Added shared `imageLoading` intents (critical eager/high, visible eager, deferred lazy) and applied them to every Next Image call site. Removed direct priority/preload props from underlying Next Images; the existing ProductImage priority input maps to the critical intent. First shop row and initial cart items are eager, dedicated Game Zone cards are eager, homepage Game Zone cards remain lazy, and reused hero/promo service art does not downgrade matching image URLs to lazy.
- Added an ESLint guard requiring the shared policy on imported Next Image elements and rejecting competing loading/priority/preload props. Updated root agent instructions and documentation. Page error collection now also catches LCP and priority/lazy warnings; added policy/banner regression source. No warnings were suppressed or disabled.
- Source and whitespace reviewed. Build, lint, typecheck, tests and browser LCP/responsiveness checks were not run in this update. Actual future LCP candidates depend on viewport/content; guardrails reduce regressions but do not constitute a universal warning-free guarantee.

### 2026-10-30: Inventory percentage discounts and prominent product conditions

- Added compact shared inventory pricing fields: price before discount, decimal discount percentage, live final selling price and rupee savings. Rounded whole-rupee calculation is shared with server validation; client final-price submissions are not trusted. The saved `price` remains the final price used by cart, sorting, structured data and checkout, with `originalPrice` and `discountPercent` for presentation. Setting 0% removes the discount. Non-zero discounts that do not reduce the price by a rupee are rejected. 100% is supported as a zero-price item, but the existing Razorpay flow rejects zero-price checkout.
- Existing records are not rewritten. Legacy original/final price pairs derive a percentage that preserves their saved price when reopened without changes. Added optional discount metadata to the public model and bumped the product cache key; inventory/category saves also revalidate `/cart`.
- Added reusable ProductPrice, DiscountBadge and ConditionBadge components. Shop grid, homepage mobile cards/desktop shelf, cart and admin list show the final price and genuine savings consistently; customer condition tags use blue for New, violet for Pre-Owned and a contrasting green outline for Refurbished. Shop badges sit above the image, leaving artwork uncropped. No new animation loops or dependencies were added.
- Added source regression cases for rounding, legacy price preservation, invalid/no discounts and inconsistent percentages. Reviewed source and whitespace only. Build, lint, typecheck, tests, browser layout and live Firebase save/checkout checks have not been run for this update, following the batched-check convention.

### 2026-10-30: Reported shop hydration mismatch

- Read the supplied pasted hydration trace. It shows old client platform radio markup and old filter-panel classes hydrating newer server pressed-button markup/native-scroll attributes. The current ProductBrowser source consistently uses the newer markup and prioritizes the first catalogue image; no time/random/browser branch controls those attributes.
- This points to stale client/development assets from different source revisions, not evidence of a cart/theme-state bug. Did not add suppressHydrationWarning or disable SSR.
- Process inspection was denied by the environment, so no server was stopped and no generated cache was removed or moved. User must stop/restart the development server and hard-refresh the browser; if needed, move only `.next/dev` aside while the server is stopped. No customer/Firebase data needs clearing.
- Source reviewed only. Did not run build/lint/tests or claim a browser reproduction/resolution for this report.

### 2026-10-30: Multi-product cart and Razorpay test-mode checkout

- User explicitly selected test-mode checkout in addition to the cart. Added stock-aware Add to cart on shop/home shelf, desktop/mobile cart link and quantity badge, and themed `/cart` with quantities, removal, unavailable-stock handling, subtotal and one combined WhatsApp message. Persist only IDs and quantities with hydration-safe cross-tab subscriptions and in-memory fallback.
- Added server-only Razorpay REST integration with test-key-only gating, uncached current Firestore price/stock validation, integer-paise totals, request UUID duplicate-create protection, stored order snapshots, constant-time checkout signature verification and authenticated captured-payment verification. Added signed webhook reconciliation with idempotent paid updates. These paths have not processed a real or sandbox payment during this session.
- Added protected, read-only Admin > Test orders (latest 50). Sandbox records live in `checkoutTestOrders`, separate from inventory/service records. No real-stock reservation, decrement, delivery or live-payment enablement is implemented. Updated CSP for hosted checkout and its CDN; the external script loads only on a configured cart page. No new SDK dependency is needed.
- Added `.env.example` placeholders RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET and RAZORPAY_WEBHOOK_SECRET without reading/modifying `.env.local`. Documented webhook/capture settings and live-payment prerequisites in `RAZORPAY_SETUP.md`; flagged cart/provider changes for the unapproved privacy draft and preview.
- Added cart browser regression source and expanded postbuild smoke checks from 8 to 12, covering invalid cart/payment requests, origin rejection and unsigned webhooks without provider calls or Firebase writes. Lint passed. Production build passed compilation, TypeScript, static generation and all 12 automatic API checks. Diff whitespace check passed. Full browser tests, visual layouts, sandbox checkout, callback/webhook replay and actual Firebase/Razorpay connectivity remain unverified.

### 2026-10-30: Architecture review and automatic build health checks

- Reviewed application boundaries, shop filtering, protected admin actions, Firestore transactions/initialization, uploads, caches, enquiry controls and build workflow. Preserved pre-existing worktree changes; no dependency upgrade or Firebase configuration/data mutation was performed.
- Fixed the strict-TypeScript category rename lookup, bounded streaming JSON byte limits, consistent no-store/retry headers, and a hard cap for process-local rate-limit keys. Platform chips now use pressed-button semantics. Nested admin/filter scrolling uses native scroll; admin footer controls no longer use overlapping absolute placement on short screens.
- Added recoverable themed route error UI and no-index metadata for protected admin pages. Updated stale contact-test fixtures and platform selectors without running Playwright.
- Added `/api/health` and an isolated loopback production smoke runner with eight checks, including origin guards, token issuance, unsigned payload rejection and declared/chunked UTF-8 body limits. The runner never submits a valid customer enquiry, accesses Firestore or stops the user's development server. Health failures propagate through npm postbuild.
- Final `npm.cmd run lint` passed with no reported issues. Final `npm.cmd run build` passed compilation, TypeScript, static generation and all eight postbuild API checks. An earlier build failed on the category rename type error; it was fixed before the successful builds. Diff whitespace check passed.
- Major recommendations, not implemented: explicit admin-only demo seeding, verified backup/restore policy, distributed abuse/replay protection and proxy trust, privacy approval/CSP planning, collection pagination, and optimistic concurrency/audit history. Live provider readiness, browser/mobile/theme verification, full end-to-end tests and deployment measurements remain unverified.

### 2026-10-30: Category-led shop in the GamexChange theme

- Inspected the supplied GameNation reference and screenshot for browsing organisation only. Implemented original GamexChange blue/violet department controls, platform chips, compact image-led cards and a responsive filter panel, not the reference's visual design or branding.
- Shop supports Games, Consoles and Accessories plus All gear; text search; platform, category, condition, genre and Disc/Cartridge filters; min/max prices; genuine-discount filtering; recommended/latest/name/price sorting; clearable selections and client-side batches of 24. Mobile filters expand inline and cards use two columns on phones. No per-keystroke database reads or list-wide Motion layout animations.
- Added optional inventory metadata (shopSection, genre, format, edition, description, originalPrice) and platform suggestions/normalisation, while preserving existing image uploads and legacy records. Public cards render uploaded game covers and hardware photos uncropped, retain WhatsApp enquiry rather than pretending there is checkout, and never fabricate stock or savings.
- Removed Gaming PC from default category suggestions, blocked new PC-component categories/assignments and excluded existing PC-category stock from public results without deleting records. Updated fallback FAQ wording; already-managed Firestore FAQs are not silently overwritten.
- Updated public metadata/structured condition data and category links. Old records infer their shop section from category until edited; optional new fields do not require a migration or new Firebase settings.
- Updated shop regression test source. Reviewed source, references and whitespace only; build, lint, typecheck, browser responsiveness and live upload checks remain deferred until requested.

### 2026-10-30: Four aligned hero shortcuts

- Added Shop, Sell & Exchange, Repairs and Game Zone as a labelled Quick actions navigation group, pointing to the existing product, exchange, repair and gaming routes. Shop is primary; the other three are secondary.
- Used equal-width columns and matching 56 px minimum heights in a 2 by 2 grid. Smaller icon discs, responsive typography and naturally wrapping labels fit narrow phones without clipping; styles are scoped to hero buttons.
- Removed magnetic movement on these four buttons to keep the grid aligned while preserving existing hover/tap styling and reduced-motion handling. Source and whitespace reviewed; browser and full validation remain deferred until requested.

### 2026-10-30: Larger hero art on large screens

- At viewport widths of 1536 px and above, the product stage expands into the unused right-hand gutter by up to 160 px. The rule retains the container's existing 32 px viewport-edge margin, without moving the headline or changing tablet/mobile sizing.
- Kept object-contain and the existing motion scale instead of adding zoom/cropping. The stage's normal-flow aspect ratio reserves the extra height so the following banner cannot overlap. Updated the image sizes hint for the larger rendered artwork.
- Source and whitespace reviewed. Actual browser clipping, orientations and themes have not been visually verified; build, lint, typecheck and tests remain deferred until requested.

### 2026-10-30: Footer social icons

- Replaced Instagram, Facebook and WhatsApp footer text with lightweight inline SVG icons using a shared SocialIcon component. Kept existing URLs and safe external-link attributes.
- Added accessible link labels, tooltips and 44 px tap targets with a footer-themed hover treatment. Source and whitespace reviewed; runtime checks remain deferred.

### 2026-10-30: Homepage admin group and FAQ management

- Grouped Banners and FAQs as sub-items under Homepage in admin navigation. Existing banner URL and saved data are unchanged; shared nav styling keeps parent-level and nested links consistent.
- Added `/admin/faqs` with collapsed add/edit forms, question and answer fields, order, draft/published visibility, counts and delete actions. Mutations require MFA admin authorization and the existing confirmation popup; server validation blocks duplicate questions, invalid values and more than 30 saved FAQs.
- Added the Firestore-backed FAQ registry at `settings/homepageFaqs`, copying the five current questions once from source on first admin access. Empty/unpublished lists stay empty and are not automatically reseeded. No new environment variables, dependencies or indexes are required.
- Homepage streams the published FAQ list with a dedicated 60-second cache and immediate invalidation after admin changes, without blocking the hero. Draft text is not sent to the public accordion; zero published FAQs hides that section.
- Source and whitespace reviewed; build, lint, typecheck, browser and live Firebase workflows remain deferred until requested.

### 2026-10-30: Three static Game Zone rate cards

- Replaced the six alternating gallery/rate slides with `GameZoneCards`: one static, background-image card each for PS5, PS4 and Logitech G29 Racing. Prices and player counts remain unchanged.
- Homepage and Game Zone reuse the same three-card grid, three columns on wider screens and vertically stacked on phones. Dark overlays and scoped high-contrast colours keep prices readable in both themes.
- Removed carousel controls, horizontal/pinned scrolling, motion hooks and the duplicate pricing section on the Game Zone page. Existing local gaming artwork is reused as decoration; no new image assets or dependencies were added.
- Updated the Game Zone regression test source for card count, all rates, background images, no Next/Previous controls and viewport width. Source and whitespace reviewed; build, lint, typecheck and runtime tests remain deferred until requested.

### 2026-10-30: Supplied terms and policies and replacement FAQ

- Read `GXC Concepts Website Content.docx` from Downloads. Added source-based Terms and Conditions and six related policy pages: returns/refunds, pre-owned products, shipping/delivery, trade-in, wallet/store credit and extended warranty. Business identity, registered address, CIN and support details come from the source.
- Added `/terms`, `/policies`, `/policies/[slug]`, footer legal links and sitemap entries. The shared static legal layout uses semantic theme tokens, gradient headings, mobile-safe text wrapping, section anchors and a sticky desktop contents panel. Original Word file is unchanged.
- Replaced six old FAQs with the document's five questions. Corrected grammar and formatting; adapted buying/selling/delivery instructions to actual WhatsApp enquiries because checkout, sell carts, automatic valuation and PIN-code lookup are not implemented. Preserved supplied 7-day eligible game returns and conditional 30-day hardware warranty; did not turn them into unconditional guarantees.
- No privacy policy was present in the source. User explicitly requested a draft for review. Added `.agent/PRIVACY_POLICY_DRAFT.md` with assumptions/approval checklist and a themed, MFA-protected `/admin/privacy-preview` page. Draft data is server-only and excluded from public navigation/sitemap. It requires approval and business/legal review before publication; live provider regions, logs, retention schedules, marketing and children's-data processes are not verified.
- Document-reading skill was used for source extraction and editorial review, not DOCX authoring. No new Word artifact was created. Source/reference/whitespace checks only; build, lint, typecheck, browser and live-data verification remain deferred as requested.

### 2026-10-30: Three Game Zone packages and recurring transition error

- Updated available experiences to PlayStation 5, PlayStation 4 and Logitech G29 Racing, using the supplied poster. Solo/Duo/Trio hourly rates: PS5 150/200/250 INR; PS4 100/150/200 INR; G29 250/300/350 INR. Prices are total package rates, not per-person prices.
- Shared `ZoneRates` renders player counts and hourly prices in the gallery and pricing cards. Removed obsolete arcade, half-hour and complimentary-beverage listings, and the arcade-themed gallery slide. Updated home/hero copy, FAQ, metadata, enquiry choices and server validation to match. Historical customer reviews mentioning arcade remain untouched.
- Removed native View Transition calls from theme switching after the hidden-document error recurred. The existing lightweight 220 ms CSS colour fade remains for visible pages; hidden/reduced-motion updates commit immediately. No global error suppression was added.
- Updated pricing and theme regression test source. Reviewed references and whitespace; build, lint, typecheck, tests and browser verification remain deferred until requested.

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
