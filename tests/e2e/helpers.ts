import type { Page } from "@playwright/test";

const PIXEL = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64");

/** Serves a 1×1 PNG for optimised remote images so tests never depend on the client's CDN. */
export async function stubImages(page: Page) {
  await page.route("**/_next/image**", (route) => route.fulfill({ status: 200, contentType: "image/png", body: PIXEL }));
}

/** Collects console errors and uncaught exceptions for assertions. */
export function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}
