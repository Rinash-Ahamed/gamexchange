import { expect, test } from "@playwright/test";
import { canPurchaseProduct, isPublicInventory } from "../../src/lib/product-availability";

test("out of stock stays public but cannot be purchased even with a positive quantity", () => {
  expect(isPublicInventory({ status: "out-of-stock", category: "Console" })).toBe(true);
  expect(canPurchaseProduct({ status: "out-of-stock", stock: 5 })).toBe(false);
  expect(canPurchaseProduct({ status: "active", stock: 0 })).toBe(false);
  expect(canPurchaseProduct({ status: "active", stock: 2 })).toBe(true);
});

test("draft and unsupported categories remain private", () => {
  expect(isPublicInventory({ status: "draft", category: "Console" })).toBe(false);
  expect(isPublicInventory({ status: "out-of-stock", category: "PC Components" })).toBe(false);
  expect(canPurchaseProduct({ status: "draft", stock: 2 })).toBe(false);
});

test("legacy catalogue defaults remain purchasable and zero stock remains visible", () => {
  expect(canPurchaseProduct({})).toBe(true);
  expect(isPublicInventory({ status: "active", category: "Console" })).toBe(true);
});
