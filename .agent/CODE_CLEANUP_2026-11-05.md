# Behavior-preserving cleanup audit

Date: 5 November 2026.

## Scope and method

Reviewed application source imports/exports and source dependency references, server data/query helpers, upload and image-serving flows, catalogue filtering, cart state, Firebase client setup, visibility subscriptions and enquiry/payment request handling. TypeScript noUnusedLocals/noUnusedParameters and ESLint supplement source-reference inspection. Next route exports and instrumentation entrypoints are framework-owned and must not be removed merely because they have no ordinary importer. This is a source audit, not a proof that every CSS selector, asset or remotely saved reference is unused.

Unrelated working-tree changes were preserved. No environment values or customer records were printed or edited. No live Firebase, Storage, email, payment or provider-setting writes were made.

## Changes

- Removed four unreachable retired components: ControllerArt, ShelfShowcase, ProductCard and ProductStage. The old shelf was not mounted by the homepage, and the active hero uses the current composition. Confirmed no remaining source, script or test imports. Files are recoverable through Git; no product images, customer data or active UI were deleted.
- Removed unused EnquiryInput and EnquiryKind type exports. Existing strict unused-local/parameter scan was already clean; no arbitrary import churn.
- Extracted process-card-image for the shared inventory/franchise/homepage image decoding policy. Kept MIME/size validation, pixel/page/format limits, orientation, metadata removal, dimensions, WebP quality, Storage metadata, per-flow error messages and upload/delete behavior unchanged. Banner artwork has different dimensions and remains separate.
- Extracted browser-config for public Firebase identifiers. Kept separate customer/admin app names, persistence, OAuth resolver and MFA behavior. Customer configuration checks no longer import the admin browser initializer.
- Applied request-scoped React cache to listInventoryCategories so an admin render's inventory list and explicit category dropdown load share one category listing operation. This is not a cross-request or persistent authorization/data cache. Mutations still initialize/check categories and validate conflicts inside transactions.
- Consumer catalogue facets reuse their already-scoped product list rather than filtering it twice. Search, sort, counts, selected alternatives and empty-state rules are unchanged.
- Cart product lookup builds a memoized first-entry-per-ID index instead of searching the complete catalogue for every cart line. First-match semantics are retained even for duplicate IDs.
- Shared the single document visibility listener among current animation subscribers; listener is removed when the last subscriber unmounts. SSR snapshot behavior and pause conditions remain unchanged.
- Removed the unused Lenis dependency using an offline, lifecycle-script-disabled npm uninstall; native CSS scrolling is the active implementation. Package/lock consistency is checked after that operation.

## Deliberately retained safeguards and larger work

- Client/server validation is not redundant security: server schemas, decoded-image validation, token verification, ownership and publication checks remain enforced.
- State/ref pairs that protect against synchronous double submission or preserve payment verification across renders have different responsibilities and remain.
- Enquiry token requests already coalesce in-flight work and warm only on interaction. Payment confirmation re-fetches gateway status intentionally; callbacks and signed webhooks are independent recovery paths. No financial verification was removed to reduce calls.
- Image-route database publication/version checks remain per request, outside byte caches. Avoiding those reads could expose unpublished artwork. Existing process/public-data caches and invalidation remain.
- Full-catalogue Firestore reads, client filtering and cursor-based backend pagination are an architectural scalability follow-up, not silently rewritten during cleanup. Existing pagination limits rendered cards to 20.
- Retention, privacy/legal approval, live-payment readiness, finance emails and missing uploaded objects from the earlier incident are not resolved by code cleanup.
- Broad CSS, public asset and dependency replacement cleanup needs separate proof of dynamic/runtime usage; no unsafe blanket deletion or dependency upgrade.

## Verification

Before final dependency cleanup: lint passed; typecheck with noUnusedLocals/noUnusedParameters passed; production build passed compilation/TypeScript/27 pages and 14 isolated API/import checks. A read-only in-memory harness compared 72 catalogue/filter/facet results against the pre-cleanup Git source and passed. Real Sharp JPEG/PNG/WebP processing produced identical bytes to the prior algorithm; unsupported MIME and undersized decoded-image checks passed. The first harness attempts were blocked by child-process permissions, not an application assertion failure; moving Git inspection to the shell resolved that harness limitation. No files, provider calls or customer data were used by these fixtures.

Final checks after dependency cleanup passed: npm run lint; npm run typecheck with noUnusedLocals/noUnusedParameters; npm run build including TypeScript, 27 static pages and all 14 isolated postbuild API/import checks. Manifest/lock dependencies match and contain no Lenis entry; whitespace checks passed. Full browser/E2E, mobile/theme rendering, live upload/auth/payment and production performance measurements are not covered by these checks.
