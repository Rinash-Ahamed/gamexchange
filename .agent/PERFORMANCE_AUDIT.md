# Quick performance audit

Related documents: [project overview](README.md), [session context](SESSION.md), [Firebase setup](FIREBASE_SETUP.md).

Date: 2026-10-29

Scope: homepage rendering, public catalogue/banner data, banner image API, animation activity, footer video and enquiry API. Findings are from source inspection and local checks, not a production browser trace.

## Changes applied

### Production-readiness audit, 5 November 2026

See PRODUCTION_READINESS_2026-11-05.md for ranked findings and bounded local measurements, and LOAD_TESTING.md for unexecuted staging-only k6 profiles. Added allowlisted backend Server-Timing/request results, safe server error events, cheap pre-database image-version rejection, direct admin-dashboard authorization and reliable worker failure reporting. Ambiguous image commits now retain possibly referenced files rather than deleting them. No visual quality, motion, business rules or hosting/CPU configuration was changed.

The isolated sequential diagnostic measured warm homepage full-response p95 95.1 ms and shop 31.4 ms, but first homepage request took 3299.5 ms. These exclude live Firebase/provider, image/browser and concurrency costs; they are not production latency/FPS guarantees. All-route JS/CSS chunk raw bytes stayed unchanged at 1,350,498. No before-change latency result exists. Global rate-limit contention, full-catalogue/admin collection reads, metadata read costs and real-image/cold-start behavior remain staging follow-ups.

### Catalogue payload follow-up, 2026-11-05

Confirmed existing 20-card pagination, deferred lower-row covers, critical/eager initial row, memoized cards, deferred filter results and intent-only product prefetch. Added a non-mutating catalogue-summary projection before sending shop/cart/related-card props to clients: removes unused full descriptions and gallery arrays while keeping cover, pricing and every filter/search/sort field. Detail pages retain full product content. Shop ItemList structured data is now bounded to the initial filtered 20-product page, with the full result count retained, instead of serializing every product again. Memoized the page slice to avoid allocating it on unrelated UI updates. Image bytes, quality and photo limits are unchanged.

This reduces response data but is not backend pagination: Firestore/cache reads and initial browser filter metadata still scale with the full available catalogue. Fully server-side filtering, facets and cursor pagination remain a separate larger-catalogue implementation. No arbitrary product truncation, fake counts, new indexes or live data changes. Added projection/2000-item page-limit regression source, not executed. No build/lint/tests or browser/network/FPS measurements in this update, per explicit-run convention.

| Finding | Change | Expected benefit |
| --- | --- | --- |
| The homepage awaited all Firebase data before returning its hero. | Start catalogue and banner reads together; stream their sections behind Suspense boundaries. Reserve placeholder space. | Hero markup can render without waiting for database calls. |
| Each configured homepage visit performed a seed check, inventory query, banner settings read and published-banner query. | Cache public product/banner results for 60 seconds. Share the product cache between homepage and shop. | A warm public data cache serves those results without Firestore reads. This is a query-count change, not a measured latency improvement. |
| Public changes needed consistent freshness across both pages. | Admin inventory/banner mutations immediately expire their cache tags and revalidate affected routes. | The next request after an admin save reads fresh public data. Direct Firebase Console edits can take roughly a cache window to appear. |
| Inventory existence checks repeated on every list/dashboard request. Empty inventory could also trigger repeated demo seeding. | One shared initialization promise per server process plus a persistent Firestore initialization marker; transaction protects first setup. | Fewer recurring reads; deliberately empty inventory remains empty after initialization. Failed initialization can retry. |
| Banner server imports loaded the native image processor even for ordinary public reads. | Import Sharp only inside the upload-processing path. | Less initialization work on public requests. |
| Concurrent banner image requests could repeatedly download identical Storage objects. | Coalesce simultaneous downloads and keep an 8 MB bounded LRU cache of immutable image bytes per process. | Fewer Storage downloads and less duplicate buffering. Cache resets on a cold start. |
| Hero and carousel timers ran while away from their sections. | Gate timers using intersection and page visibility. | Less off-screen rendering and background work; keep the visible 2.5-second banner interval. |
| Testimonials and diagnostic SVG loops ran off-screen. | Pause CSS loops outside the viewport and while the tab is hidden. | Lower background rendering work, while retaining continuous motion during viewing and hover. |
| Footer video kept playing after it had first loaded. | Prefetch near the footer, play only while actually visible, pause in hidden tabs, and avoid loading for reduced motion. | Less unnecessary decoding and playback. |
| Below-fold carousel images requested preload priority alongside the hero. | Keep the hero prioritized; let banner images load lazily until the section is near the viewport, then eagerly request the current and next slides. | Less initial competition for the hero image. |
| The homepage shelf included every available product in its scroll runway and client payload. | Show up to six featured products, or the first six available products if none are featured. | Bounded homepage payload and runway. The full catalogue remains available in the shop. |

## API and authorization checks

### 2026-10-30 image-loading follow-up

The banner LCP warning exposed a timing gap in the earlier lazy-to-eager viewport policy. Mounted banner images now always use eager loading. The first slide is present in the initial server HTML; other slides mount once within a 300 px viewport margin, independent of the animation's ongoing visibility gate. This retains deferred off-screen mounting without changing an LCP candidate back to lazy. Shared loading intents now cover all Next Image call sites, with first-row shop, cart and dedicated Game Zone images considered for above-fold use. Shared hero/promo art reused by service cards also stays eager, avoiding contradictory policies for the same optimized URL. ESLint and page warning collection provide regression guardrails. Source/whitespace reviewed only for this follow-up; no browser timing, build, lint or tests were run, and no universal future-LCP guarantee or measured speed improvement is claimed.

- The enquiry endpoint already avoids database calls, limits request size, applies rate limits, verifies origin and single-use tokens, and returns uncached responses. No need to add public response caching there.
- Admin sessions, UID checks, email verification, TOTP verification, account status and revocation remain uncached.
- Banner image visibility and draft authorization are still checked on every image endpoint request. Only the immutable file bytes are reused. Previously cached public images may remain in a browser or image optimizer cache after unpublishing, as documented in Firebase setup.
- Public data caching uses Next's existing Data Cache rather than a private process map. The Storage byte cache is explicitly per process and bounded.

## Verification and limits

### 2026-11-03: Native custom cursor

- Added two small SVG assets used by native CSS cursor URLs on public pages. This adds no JavaScript listener, pointer-following DOM element, continuous animation loop or dependency. Existing card-specific lighting remains separate and unchanged.
- Fine-pointer/hover, non-reduced-motion and non-forced-colour media guards limit the custom cursor to eligible desktop users. Admin screens and native input/media/disabled/busy states retain standard behavior, with native fallback keywords when cursor assets are unavailable. Colors have both light and dark outlines rather than expensive blur effects.
- Source/whitespace and vector markup reviewed only. Browser/OS cursor rendering and frame timing were not measured; build, lint and tests were not run for this update.

### 2026-11-03: Quick interaction audit after admin copy/layout updates

Source-level findings and fixes:

- Shop search and facet counting previously ran in the same urgent render as input edits. ProductBrowser now uses React useDeferredValue for the saved filter object, keeping controlled inputs immediate while result/facet rendering catches up without a fixed debounce delay. Results expose aria-busy; pagination is temporarily disabled while results are pending so it cannot navigate the previous filter set. All filters, sorting, counts, page sizes and stock visibility rules remain unchanged.
- CatalogCard is memoized and the section price ceiling is memoized. Unchanged product objects and loading flags can skip card rerenders when unrelated filter-panel state changes. This does not cache stock or suppress Add to cart's own context updates.
- useMedia previously supplied a fresh subscription function each render and recreated matchMedia objects on snapshot reads. It now shares a lazy browser MediaQueryList and stable subscription per fixed internal query, attaches one native change listener for its current subscribers, removes that listener when unused, and preserves the same server/hydration fallback. LightCard uses the shared pointer/reduced-motion query rather than evaluating matchMedia on every pointer event.
- LightCard still coalesces pointer work to one requested frame and writes custom properties only to the decorative overlay. Pointer leave now cancels the outstanding frame and clears its pending coordinates; touch/non-hover/reduced-motion cases do not attach the pointer-move handler.
- NavigationPrefetch no longer schedules hover timers over non-links. Moving between children of the same link no longer repeatedly cancels/reschedules its warm-up. Existing 80 ms intent delay, route allowlist, bounded deduplication, Save-Data/2G guards and public-only prefetch policy remain.

No artwork, image quality, card styling, motion cadence, content or security checks were removed. React implementation references: [useDeferredValue](https://react.dev/reference/react/useDeferredValue) and [stable external-store subscriptions](https://react.dev/reference/react/useSyncExternalStore).

Initial lint/build/TypeScript and all 14 isolated postbuild API checks passed; final validation after the pagination safeguard is recorded in SESSION.md. Browser profiling/E2E was not run in this quick build/lint request. These are bounded-work improvements, not measured FPS, input-latency, LCP or production API-speed claims. Larger catalogue payloads and full admin collection reads still need cursor-based query design when warranted; SVG stroke painting and real-image/mobile performance need a separate production trace. Firebase latency, live authentication/uploads, hosting cold starts and payments were not measured. Authorization and idle-session reads remain uncached deliberately.

### 2026-11-03: Hero fibers and platform motion

- Reworked decorative fibers as a coordinated sweeping bundle with shared theme-aware gradients, static wide-stroke bloom and staggered short highlights. Removed per-pulse drop-shadow filters and ineffective will-change hints for stroke painting. Stroke-dashoffset still requires painting; this is not described as compositor-only motion. Smaller screens omit the third track, and existing hidden/off-screen and reduced-motion gates remain.
- Platform raster artwork uses one 5 to 9 px, eight-second 2D float instead of combined 24 px bounce, rotateY/rotateZ and scroll-driven vertical displacement. The entrance no longer applies an animated brightness filter to this large subtree. The asset, scale, sizing, responsive reservation, static artwork styling and scroll fade are unchanged.
- Source and whitespace checked only. No build, lint, tests, live browser recording, high-refresh-rate measurement or mobile/theme visual verification performed. Expected reduction in projection/filter work is a source-level assessment, not a measured FPS improvement.

### 2026-11-03: Theme/browser validation stability

- The scheduled theme callback rechecks manual preference when it fires. Bootstrap readiness has a non-DOM completion signal; no new script tag, layout change or rendering loop is added. Website appearance and animation quality remain unchanged.
- Default browser acceptance checks now use one worker. A repeated two-worker diagnostic had seven execution failures in 12 cases; concurrent clock/paint/axe behavior remains a separate stress condition, not a production frame-rate measurement. Accessibility checks wait for fonts and finite entrance transitions but leave infinite decoration active and retain contrast assertions.
- Final source passed lint and production build/TypeScript with all 14 isolated API checks. All 88 repeated desktop/mobile theme/accessibility cases passed with one worker and no retries/skips; details are in the QA audit. These checks use image fixtures and do not establish parallel stress stability, real-image LCP or physical-device FPS.

### 2026-11-03: Security protection tradeoffs

- Configured Firebase deployments now use shared Firestore rate/replay transactions rather than per-instance maps. This intentionally adds database operations to API requests, not to animation frames or ordinary public page views. SDK loading is deferred until the shared path is used. Staging latency/cost and contention remain unmeasured; do not claim these security changes improve API latency.
- Health gates remain contract checks, not performance benchmarks. SDK import and HTTP allowances are now 30 and 15 seconds to accommodate dependency cold-loading/slow local filesystem; final build/API gate passed. Separate protected read-only readiness probes do not verify writes or payments. No production FPS/LCP/latency guarantee is made.

### 2026-11-02: Native scrolling and bounded rendering work

- Replaced the remaining Lenis wheel interception/always-running RAF loop with native browser scrolling on all routes. Browser CSS smooth anchor/programmatic scrolling, fixed-header offsets and reduced-motion overrides remain. No content, graphics, video, carousel controls or visible animation were removed. Lenis remains an unused dependency pending a separate dependency cleanup; it is no longer imported into the runtime or CSS.
- Nav compact mode now uses one IntersectionObserver marker at the existing scroll threshold rather than a Motion scroll-value callback on every frame. Its width transition/active pills remain. Pointer-following card custom properties are written to the decorative overlay rather than the ancestor, reducing inherited-style invalidation across card content.
- Promo slides use paint containment and delayed visibility hiding after the existing 520 ms crossfade. Invisible slides stop participating in paint while their loaded images stay mounted. Rotation interval, image quality, dimensions and motion remain. Hero filtered artwork is promoted separately from its animated wrapper to allow cached compositing; actual layer/raster performance still needs profiling.
- Catalogue matching now prepares search terms/min/max once per pass instead of once per product for every facet, and does not construct searchable product text when the query is empty. Filtering/count/sort semantics remain unchanged. Added native-anchor regression source.
- Source/whitespace reviewed only. Browser inventory reported that its access host was unavailable, so no DevTools trace, frame timing or visual/browser QA was obtained. Build, lint and tests were not run because they were not requested in this turn. 120 fps is a target for capable hardware, not a measured or guaranteed outcome; a 120 Hz display and approximately 8.3 ms frame budget are necessary. Network/database/server latency remains a separate measurement.

### 2026-10-30: Preserve-design interaction and navigation pass

- Retained smooth scrolling but shortened its wheel easing from 0.9 to 0.22 seconds with a normal 1x wheel multiplier. Load Lenis only for eligible fine-pointer, non-reduced-motion public routes. Reinitialize on route changes to cancel stale inertia; admin uses native scrolling. Optional chunk-load failure leaves native scrolling intact.
- Added one shared IntersectionObserver for gradient headings and footer heartbeat. Off-screen loops pause without hiding content; streamed sections/new headline nodes are observed, disconnected nodes are released, and hidden tabs pause these effects. Existing hero/banner/review visibility gates remain.
- Coalesced pointer-following LightCard layout reads and style writes to one animation frame. Nav/shelf React state now updates only when compact mode or active product actually changes, not on every scroll event. All visible treatments remain.
- Added route loading shells for immediate pending feedback and partial prefetch boundaries, plus delegated hover/focus/touch public-route prefetch. Intent requests are deduplicated, bounded and skipped for Save-Data/2G connections, external URLs and admin routes. Checkout/auth actions are not prefetched. Existing catalogue visibility, 60-second data caching and mutation invalidation remain unchanged.
- Converted the hero source from 1,864,141-byte PNG to 1,405,332-byte lossless WebP (about 25% smaller), retaining dimensions and transparency. Decoded comparison found zero visible-pixel differences; only RGB values of fully transparent pixels differ. Kept the original PNG. Both hero and reused service art use the new source; Next's existing optimized image policy is retained. This source-size reduction is not a measured browser transfer/LCP improvement.
- Added browser regression source for decorative pause/resume and navigation. Reviewed source, asset pixels and whitespace only. Build, lint, tests, live Vercel/Firebase, browser layouts, FPS, route latency and Core Web Vitals have not been verified in this pass. No instant-navigation or FPS guarantee is claimed. The Vercel runtime 500 still requires sanitized logs.

- TypeScript check passed after implementation.
- Diff whitespace checks passed.
- There was no HTTP server listening on localhost:3000 during the audit, so no page timings, API latency percentiles, FPS, Lighthouse scores or Core Web Vitals improvements are claimed.
- Build, lint and end-to-end tests were not run, following the project's requested workflow.
- First-session game intro intentionally holds interaction for up to about 1.8 seconds. Kept as requested. This should be distinguished from network or rendering lag during measurement.
- Service and inventory admin lists currently fetch full collections. Add cursor pagination when their real sizes justify it; do not silently truncate records.
- Large glow filters, continuous gradient text and first-time image encoding remain candidates for browser profiling. Their appearance was preserved in this pass.

## Production measurement follow-up

After a requested production build, compare cold and warm homepage/shop requests, API timings and mobile browser recordings. Check cache invalidation by editing stock and banner visibility in admin, then visiting the public pages. Test rotation pause/resume, reduced motion, portrait/landscape layouts and first-session intro separately. Use deployed-region measurements to assess Firebase region/network latency.

Implementation references: [Next Data Cache](https://nextjs.org/docs/app/api-reference/functions/unstable_cache), [immediate tag invalidation](https://nextjs.org/docs/app/api-reference/functions/updateTag).
