import { expect, test } from "@playwright/test";
import { customerSignInError } from "../../src/lib/firebase/customer-errors";

test("sign-in distinguishes domain, provider, popup and connection errors", () => {
  expect(customerSignInError({ code: "auth/unauthorized-domain" })).toContain("not authorized for this website address");
  expect(customerSignInError({ code: "auth/operation-not-allowed" })).toContain("has not been enabled");
  expect(customerSignInError({ code: "auth/popup-blocked" })).toContain("browser blocked");
  expect(customerSignInError({ code: "auth/network-request-failed" })).toContain("connection");
  expect(customerSignInError({ code: "auth/popup-closed-by-user" })).toContain("closed before finishing");
  expect(customerSignInError({ message: "private provider payload" })).not.toContain("private provider payload");
});

test("homepage and cart retain an OAuth-compatible document policy", async ({ request }) => {
  for (const path of ["/", "/cart"]) {
    const response = await request.get(path);
    expect(response.headers()["cross-origin-opener-policy"]).toBe("same-origin-allow-popups");
  }
});
