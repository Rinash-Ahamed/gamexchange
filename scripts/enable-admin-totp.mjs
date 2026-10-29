// Run explicitly after enabling Firebase Authentication with Identity Platform.
// node --env-file=.env.local scripts/enable-admin-totp.mjs
import { applicationDefault, cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
if (!projectId) throw new Error("Set FIREBASE_PROJECT_ID before enabling TOTP.");
const useDefault = process.env.FIREBASE_USE_APPLICATION_DEFAULT_CREDENTIALS === "true";
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n").trim();
if (!useDefault && (!clientEmail || !privateKey)) throw new Error("Set Firebase Admin credentials first.");

const app = initializeApp({ projectId, credential: useDefault ? applicationDefault() : cert({ projectId, clientEmail, privateKey }) });
const manager = getAuth(app).projectConfigManager();
const config = await manager.getProjectConfig();
const providers = config.multiFactorConfig?.providerConfigs ?? [];
await manager.updateProjectConfig({
  multiFactorConfig: {
    providerConfigs: [
      ...providers.filter((provider) => !provider.totpProviderConfig),
      { state: "ENABLED", totpProviderConfig: { adjacentIntervals: 1 } },
    ],
  },
});
console.log(`TOTP enabled for Firebase project ${projectId}. Existing non-TOTP factor providers were preserved.`);
