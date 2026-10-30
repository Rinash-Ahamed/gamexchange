# Firebase setup

Project files and command paths in this guide are relative to the repository root. Run commands there, not inside `.agent/`.

GamexChange stores inventory and customer service records in Cloud Firestore through the Firebase Admin SDK. Firebase Admin credentials are used only by server code and must never be exposed to the browser. Admin sign-in uses Firebase Authentication with mandatory TOTP MFA.

## 1. Create the database

1. Create or open a project in the Firebase console.
2. Open **Build > Firestore Database**.
3. Create a Firestore database in Native mode and select the region closest to the shop and hosting region.
4. The app creates its required collections on the first request. No manual collection setup or composite index is required.

The following collections are managed by the app:

- `inventory`
- `inventorySkus`
- `serviceRecords`

`inventorySkus` is an internal uniqueness index. Do not edit it manually.

## 2. Create server credentials

In Firebase, open **Project settings > Service accounts**, then generate a new private key. Copy these values from the downloaded JSON file:

- `project_id`
- `client_email`
- `private_key`

Do not commit the downloaded JSON file or any private key.

## 3. Configure the local environment

Copy `.env.example` to `.env.local`, then set:

```dotenv
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_CONTENT\n-----END PRIVATE KEY-----\n"
FIREBASE_DATABASE_ID=
FIREBASE_USE_APPLICATION_DEFAULT_CREDENTIALS=false
```

Keep the `\n` sequences in the private key when storing it on one line. The app converts them to real line breaks at runtime.

Leave `FIREBASE_DATABASE_ID` empty for the default database. Set it only if you created a named Firestore database.

For Firebase App Hosting, Cloud Run, App Engine, or Cloud Functions with Application Default Credentials, set:

```dotenv
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_USE_APPLICATION_DEFAULT_CREDENTIALS=true
```

The client email and private key are not required in that mode.

## 4. Enable admin authentication and TOTP

Blaze is the billing plan. TOTP additionally requires upgrading **Firebase Authentication with Identity Platform**. Enable it in the Firebase Authentication settings or Google Cloud Identity Platform console. Enable the **Email/Password** sign-in provider. Configure a suitable password policy and email enumeration protection.

Register a Web app under **Project settings > General > Your apps**. Add its configuration to `.env.local`:

```dotenv
NEXT_PUBLIC_FIREBASE_API_KEY=your-web-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-web-app-id
FIREBASE_ADMIN_UIDS=your-admin-user-uid
```

The public and server project IDs must refer to the same Firebase project. The public values identify the Firebase web app; the private server credentials above must never use a `NEXT_PUBLIC_` prefix.

1. Under **Authentication > Users**, create the admin account with an email and a strong password. There is no public sign-up screen.
2. Copy its **User UID** into `FIREBASE_ADMIN_UIDS`. For additional admins, separate UIDs with commas. An empty allowlist denies all admin access.
3. Add `localhost` and your production hostname to Authentication's authorized domains as needed. Use HTTPS in production.
4. Enable TOTP for the project by explicitly running:

   ```text
   node --env-file=.env.local scripts/enable-admin-totp.mjs
   ```

   This changes the selected Firebase project's MFA configuration. It requires project configuration update permissions and preserves existing non-TOTP factor providers. The app does not change project settings automatically.

5. Restart the development server, open `/admin/login`, and sign in. If the email is unverified, the app sends a verification email. Open that link and sign in again.
6. Scan the setup QR code with an authenticator app, or enter the displayed setup key manually. Enter its six-digit code to enroll.
7. Sign in again with your password and authenticator code. A dashboard session is created only after successful TOTP sign-in.

The server verifies Firebase tokens, checks the UID allowlist, verified email, current account status, TOTP enrollment, and the token's `sign_in_second_factor=totp` claim. A recent sign-in is required to create an eight-hour HTTP-only session cookie. Protected pages and every admin mutation check authorization on the server, including revoked sessions. Browser auth uses memory only and is signed out after the cookie is issued. Legacy `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` variables no longer grant access; remove them from local and hosting configuration.

If an authenticator is lost, the Firebase project owner must verify the administrator's identity, revoke their refresh tokens, and remove the lost TOTP factor using trusted Firebase Admin tooling. The user can then repeat enrollment. There is no password-only recovery bypass in the website. Removing a UID from the allowlist, disabling/deleting the account, revoking its tokens, or removing its TOTP factor blocks dashboard access.

Reference: [Firebase TOTP MFA](https://firebase.google.com/docs/auth/web/totp-mfa) and [Firebase session cookies](https://firebase.google.com/docs/auth/admin/manage-cookies).

## 5. Start the app

Restart the development server after changing environment variables. On the first inventory request, the existing catalogue products are seeded into Firestore only if the `inventory` collection is empty and the persistent `settings/inventoryInitialized` marker does not exist. Once initialized, intentionally empty inventory is not automatically reseeded. Making this an explicit admin-only import is a major follow-up in `ARCHITECTURE_REVIEW.md`.

The legacy files under `data/` are no longer read or written by the application. Keep them until any records you need have been migrated and verified in Firestore.

## 6. Homepage banner uploads

Open **Firebase Console > Storage**, create a Cloud Storage bucket if needed, and copy its exact bucket name. Add it to `.env.local` and your hosting environment:

```dotenv
FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
```

Use only the name, without `gs://` or a URL. Older buckets may end in `.appspot.com`; use the actual name shown in your console. The server service account needs permission to read, create and delete objects in this bucket. Keep client Storage and Firestore rules restricted: uploads, changes and draft image previews go through the server and require the approved admin's MFA session. No public upload rule is needed.

Visit `/admin/banners` to upload, replace, reorder, publish, unpublish and delete carousel artwork. The existing five slides are copied into `homepageBanners` when an admin first opens that page. `settings/homepageBanners` records that initialization is complete, so unpublished or deleted slides do not reappear as demo content. There is a limit of five published slides and 20 saved slides. Deleting or replacing an uploaded image removes the old object when possible; failed cleanup is logged for manual removal in Storage. Original bundled images under `public/promos` are never deleted.

Recommended artwork is **1920 × 840 px, 16:7**. Accepted inputs are static JPG, PNG and WebP up to **5 MB**, between **1280 × 560** and **4096 × 1792 px**, with a 2% aspect-ratio tolerance. Image dimensions and contents are checked on the server; files are resized to a maximum of 1920 × 840 and converted to WebP with metadata removed. Keep essential content in the central 50%, leaving 10% space above and below for mobile crops. Desktop and mobile crop previews are available in the editor.

The banner name is internal. A descriptive image alt text is required. The optional headline and supporting text appear over the artwork; leave both empty for a finished poster. There are no public links or CTA buttons. Published images are served through a same-origin image endpoint; draft images require an admin session. Uploaded images receive a new versioned path on replacement to avoid stale artwork. Normal image/browser caches can briefly retain an already viewed published image after unpublishing; banners must not contain private customer information.

Saving a published banner updates subsequent homepage visits or refreshes. Already open pages are not automatically refreshed. The carousel retains its 2.5-second interval, Joy-Con controls and reduced-motion behavior; zero published slides hide the section, and a single published slide stays still.

Public catalogue and banner data use a 60-second server cache. Admin saves immediately invalidate the relevant cache and public routes. Changes made directly in Firebase Console may take roughly one cache window to appear. Admin records and authorization are not cached. Uploaded image bytes have a bounded per-process cache, while the image endpoint still checks current visibility and draft access. See `PERFORMANCE_AUDIT.md` for the current optimization scope and measurement limits.

## 7. Inventory image uploads

Inventory uses the same `FIREBASE_STORAGE_BUCKET` and server service account as banners. No additional environment variables or public upload rules are required. Restart the development server after changing environment variables.

In `/admin/inventory`, choose a product image when adding stock. Editing a product lets you replace its image; leaving the file picker empty keeps the current image. Recommended artwork is 1200 x 1200 px. Static JPG, PNG and WebP are accepted up to 5 MB, with each side between 300 and 4096 px. Portrait and landscape images are supported without cropping. The server checks the decoded file, corrects orientation, strips metadata and converts it to WebP, fitting within 1600 x 1600 px without enlargement.

Files are saved under `inventory-images/`; Firestore stores their reference and actual dimensions. A same-origin, versioned image endpoint serves active, in-stock product images publicly. Draft and unavailable stock images require an admin session. Existing bundled and approved external product images remain supported. Replacing or deleting an uploaded product image removes its previous Storage object when possible; cleanup failures are logged. As with banners, previously public images can remain briefly in browser or optimized-image caches, so never upload private customer information as product artwork.

## 8. Shop categories

Manage categories at `/admin/categories`. No extra environment variables or Firebase indexes are required. The registry lives in `settings/inventoryCategories` and initializes once from the suggested category names and all existing inventory categories, merging case/spacing variations. Deleting unused defaults does not cause them to reappear.

Inventory writes require a registered category ID, checked inside the same transaction as the product write. New and edited items store `categoryId` plus a label snapshot. Legacy items retain their documents and resolve through the registry's original-name aliases. The live registry supplies the current label, so renaming a category updates inventory and storefront displays without rewriting every product. Original aliases remain reserved while the category exists to avoid ambiguous legacy assignments.

Names must be 1 to 160 characters; new categories are limited to 100. Duplicate names are rejected regardless of case or spacing. Deletion checks all inventory, including drafts and out-of-stock items, and is blocked while products still belong to the category. Change those products to another category first. Admin mutations require the approved MFA session, confirmation dialogs and public-cache invalidation. The shop continues to hide categories with no active, in-stock products.

## 9. Homepage FAQs

The admin menu groups Banners and FAQs under Homepage. Open `/admin/faqs` to add, edit, order, publish, save drafts or delete questions. There are up to 30 saved questions. All changes require an approved MFA session and a confirmation dialog. Only published questions and answers are sent to the public accordion; draft content stays server-side.

The first admin visit copies the current five FAQs from `src/data/faq.ts` to `settings/homepageFaqs`. This document is the persistent source once created. An intentionally empty list is not reseeded. Until initialization, the homepage uses the existing FAQ text. Public FAQ reads are cached for 60 seconds and streamed independently of the hero; admin changes invalidate the FAQ cache and homepage. Already open pages need a refresh. No new Firebase environment variables or indexes are required.

## 10. Shop browsing and inventory details

Public product details are available at `/products/[id]` from shop cards, homepage product links and cart names. They use the same cached active, in-stock, non-PC catalogue as the shop, never private inventory lookups. Supply accurate product details in the inventory description, including package contents and condition; absent descriptions/optional fields are not invented. Inventory/category saves invalidate detail pages too. Existing image uploads and saved discount prices work without new configuration, collections or indexes.

The shop has Games, Consoles and Accessories departments in GamexChange's own theme. In inventory, select **Shop section**, a category, platform and condition, then upload your product image. Existing products without an explicit section are classified from their category when displayed, without rewriting stored data. The admin platform suggestions normalise common PS4/PS5 aliases; custom platform names remain supported.

Consumer shop filters include multi-select platforms, condition, price inputs/sliders, discounted-only and sorting. Multiple subcategories, hardware brand and game genre/format/player modes/age rating/release year appear when useful metadata exists in stocked products. Edition/model stays in admin and product search/cards but is not a standalone default sidebar filter. The minimum-discount dropdown was removed to simplify buying; biggest-discount sorting remains. Inventory has matching optional brand/publisher, age rating, release year and supported-player-mode fields. Use factual packaging/manufacturer data; missing values are not guessed. Age rating is product information, not a customer age-verification mechanism. These optional fields need no migration or Firebase index.

Collapsible optional groups without relevant stock metadata are omitted from the consumer sidebar. Core platform/condition choices remain explicit, with zero counts when unavailable; zero-count choices cannot be newly selected. Counts respect other filters while retaining alternatives inside the same group. Multiple selections within one group are OR matches, while separate groups combine as AND. Selected options remain removable even if their matching count falls to zero. Game-only groups are omitted in Consoles/Accessories, and only active in-stock products are public. No unsupported preorder or out-of-stock purchase workflow has been introduced. Numbered client-side pagination shows 20 filtered products per page without truncating the available catalogue.

For Games, optional genre and Disc/Cartridge format fields populate the relevant filters. Edition/model and product details are optional. The Pricing and discount group accepts **Price before discount (INR)** and **Discount (%)**, with a live **Final selling price** preview and rupee savings. Use 0% to remove a discount. Decimal percentages are supported; the final price is rounded to the nearest whole rupee to match the existing inventory/payment model. The server validates the inputs and calculates the saved final `price`, optional comparison `originalPrice` (zero without a discount), and `discountPercent`; it does not trust a client-supplied final price. A non-zero discount must lower the price by at least one rupee. A 100% discount produces a zero-price item; zero-price items cannot use the current Razorpay checkout and need team assistance.

Existing products are not migrated or changed automatically. Legacy discounts derive their percentage from the original/final prices when opened in the editor, preserving the final price on an unchanged save. Customer shop/home/cart views share the same final-price, original-price and savings display, plus high-contrast condition and discount badges. Cart and checkout continue to use the saved final price, never discount an already-discounted price again. Inventory saves invalidate the public catalogue, cart and homepage. Only active, in-stock products are published.

The same existing Firebase upload workflow supports portrait game covers and square/landscape hardware photos. Product cards use object-contain so artwork is not cropped. Existing images are preserved on edit unless replaced. No new Storage configuration or indexes are required. Browser search/filter/sort operations work on the delivered public catalogue without extra database calls on each keystroke.

There is no PC-components shop department. New PC-component categories and inventory assignments are blocked; previously stored PC-category records are retained in admin but excluded from public stock. This update does not delete any existing inventory or remotely rewrite managed FAQ text. If the FAQ editor was already initialised, review its warranty answer and remove any old PC examples through Admin > Homepage > FAQs.

## 11. Cart and sandbox orders

`checkoutTestOrders` stores Razorpay sandbox order snapshots and verified payment references through the Admin SDK. No client Firestore write rules or new indexes are required. Admin > Test orders is a protected, read-only list of the latest 50 records. These are simulations, not fulfilment orders: real inventory is neither reserved nor decremented. See `RAZORPAY_SETUP.md` for the required server-only test keys, signed webhook setup and live-payment prerequisites. No retention cleanup or data migration has been enabled.
