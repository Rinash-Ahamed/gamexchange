# Firebase setup

GamexChange stores inventory and customer service records in Cloud Firestore through the Firebase Admin SDK. Firebase credentials are used only by server code and must never be exposed to the browser.

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

## 4. Start the app

Restart the development server after changing environment variables. On the first inventory request, the existing catalogue products are seeded into Firestore if the `inventory` collection is empty.

The legacy files under `data/` are no longer read or written by the application. Keep them until any records you need have been migrated and verified in Firestore.
