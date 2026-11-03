import type { Page } from "@playwright/test";

const PIXEL = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64");
let fixtureClient = 0;
const fixtureWorker = `${(process.pid % 65536).toString(16)}:${(Date.now() % 65536).toString(16)}`;

/** Serves a 1×1 PNG for optimised remote images so tests never depend on the client's CDN. */
export async function stubImages(page: Page) {
  // The isolated server must not share enquiry limits between unrelated browser cases.
  await page.setExtraHTTPHeaders({ "x-forwarded-for": `2001:db8:${fixtureWorker}::${(++fixtureClient).toString(16)}` });
  await page.route("**/_next/image**", (route) => route.fulfill({ status: 200, contentType: "image/png", body: PIXEL }));
}

/** Includes image-loading warnings so page checks catch LCP and priority/lazy regressions. */
export function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error" || (m.type() === "warning" && /Largest Contentful Paint|has both.*(?:priority|preload).*loading/i.test(m.text()))) errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}
