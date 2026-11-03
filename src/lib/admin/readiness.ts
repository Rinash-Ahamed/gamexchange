import "server-only";
import { firebaseFirestore } from "@/lib/firebase/firestore";
import { firebaseStorageBucket } from "@/lib/firebase/storage";
import { sharedSecurityStore, signingSecret } from "@/lib/security-store";

async function check(read: () => Promise<unknown>): Promise<"ok" | "unavailable"> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([read(), new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error("Readiness timeout")), 5000);
    })]);
    return "ok";
  } catch { return "unavailable"; }
  finally { clearTimeout(timer); }
}

/** Caller must authorize. No writes or customer records, and no provider error details. */
export async function adminReadiness() {
  const [firestore, storage] = await Promise.all([
    check(() => firebaseFirestore().collection("settings").doc("readinessProbe").get()),
    check(() => firebaseStorageBucket(() => new Error("Storage not configured")).getFiles({ maxResults: 1, autoPaginate: false })),
  ]);
  let signing: "ok" | "unavailable" = "unavailable";
  try { if (sharedSecurityStore()) { signingSecret(); signing = "ok"; } } catch { /* Keep configuration private. */ }
  return { ready: firestore === "ok" && storage === "ok" && signing === "ok", checks: { firestore, storage, signing } };
}
