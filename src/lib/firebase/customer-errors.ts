/** Only fixed messages are exposed, never provider error payloads or account details. */
export function customerSignInError(error: unknown): string {
  const code = typeof error === "object" && error !== null && "code" in error ? error.code : undefined;
  switch (code) {
    case "auth/unauthorized-domain": return "Google sign-in is not authorized for this website address. Please contact the GameXchange team.";
    case "auth/operation-not-allowed": return "Google sign-in has not been enabled for this store. Please contact the GameXchange team.";
    case "auth/popup-blocked": return "Your browser blocked Google sign-in. Allow popups for this website and try again.";
    case "auth/popup-closed-by-user": return "Google sign-in was closed before finishing. Please try again and keep the sign-in window open.";
    case "auth/cancelled-popup-request": return "Another sign-in window was opened. Finish sign-in in the latest window.";
    case "auth/network-request-failed": return "Unable to connect to Google sign-in. Check your connection or content blocker and try again.";
    case "auth/web-storage-unsupported":
    case "auth/operation-not-supported-in-this-environment": return "This browser cannot complete secure sign-in. Open the website in Chrome or Safari instead of an in-app browser.";
    case "auth/invalid-api-key":
    case "auth/api-key-not-valid.-please-pass-a-valid-api-key.":
    case "auth/auth-domain-config-required":
    case "auth/invalid-auth-event": return "Google sign-in is temporarily unavailable for this store. Please contact the GameXchange team.";
    case "auth/account-exists-with-different-credential": return "This email already uses another sign-in method. Please contact the GameXchange team for help.";
    case "auth/too-many-requests": return "Too many sign-in attempts. Please wait a few minutes and try again.";
    case "auth/user-disabled": return "This account cannot sign in. Please contact the GameXchange team.";
    default: return "Google sign-in could not finish. Please try again. If it continues, contact the GameXchange team.";
  }
}
