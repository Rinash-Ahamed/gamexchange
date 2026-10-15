export const BOOT_SCREEN_KEY = "gx-boot-seen";

/** Hides the loader before hydration for returning visitors in the same session. */
export function applyInitialBootState() {
  try {
    if (sessionStorage.getItem(BOOT_SCREEN_KEY) === "1") {
      document.documentElement.classList.add("boot-seen");
    }
  } catch {
    // The loader remains available when browser storage is blocked.
  }
}
