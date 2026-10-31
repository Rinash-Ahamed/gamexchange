# Quick performance audit

Related documents: [project overview](README.md), [session context](SESSION.md), [Firebase setup](FIREBASE_SETUP.md).

Date: 2026-10-29

Scope: homepage rendering, public catalogue/banner data, banner image API, animation activity, footer video and enquiry API. Findings are from source inspection and local checks, not a production browser trace.

## Changes applied

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
