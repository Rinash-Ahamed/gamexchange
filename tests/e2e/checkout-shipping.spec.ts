import { expect, test } from "@playwright/test";
import { shippingSchema } from "../../src/lib/payments/shipping";

const shipping = { name: "Sample Customer", phone: "9000000000", addressLine1: "12 Sample Street", addressLine2: "", city: "Coimbatore", state: "Tamil Nadu", postalCode: "641001", country: "IN" };

test("shipping details are bounded and normalized", () => {
  expect(shippingSchema.parse({ ...shipping, name: " Sample Customer " }).name).toBe("Sample Customer");
  for (const change of [{ phone: "123" }, { postalCode: "000000" }, { country: "US" }, { addressLine1: "" }, { name: "x" }, { city: "Town\nInjected" }, { addressLine2: "x".repeat(181) }]) {
    expect(shippingSchema.safeParse({ ...shipping, ...change }).success).toBe(false);
  }
});

test("order creation requires customer identity even with valid shipping", async ({ request, baseURL }) => {
  const response = await request.post("/api/checkout/order", {
    headers: { Origin: new URL(baseURL!).origin },
    data: { requestId: "123e4567-e89b-42d3-a456-426614174000", items: [{ id: "sample-product", quantity: 1 }], expectedAmount: 100, shipping },
  });
  expect(response.status()).toBe(401);
  expect(response.headers()["cache-control"]).toBe("no-store");
});

test("payment verification requires customer identity", async ({ request, baseURL }) => {
  const response = await request.post("/api/checkout/verify", {
    headers: { Origin: new URL(baseURL!).origin },
    data: { requestId: "123e4567-e89b-42d3-a456-426614174000", razorpay_order_id: "order_example", razorpay_payment_id: "pay_example", razorpay_signature: "a".repeat(64) },
  });
  expect(response.status()).toBe(401);
});
