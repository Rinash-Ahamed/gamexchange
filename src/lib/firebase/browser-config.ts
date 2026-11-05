/** Public Firebase identifiers only. Keep statically named env references for Next. */
export const firebaseBrowserConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseClientConfigured = Boolean(firebaseBrowserConfig.apiKey && firebaseBrowserConfig.authDomain && firebaseBrowserConfig.projectId && firebaseBrowserConfig.appId);
