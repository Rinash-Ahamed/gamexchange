import { expect, test } from "@playwright/test";
import { canPurchaseProduct, isPublicInventory } from "../../src/lib/product-availability";
import { filterCatalog, emptyCatalogFilters, catalogSorts } from "../../src/lib/catalog";
import { products } from "../../src/data/products";

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

test("sold-out products sort last for every sort and can be hidden", () => {
  const available = { ...products[0]!, id: "available", status: "active" as const, stock: 2, price: 9999 };
  const unavailable = { ...products[0]!, id: "unavailable", status: "out-of-stock" as const, stock: 2, price: 1, featured: true };
  const zero = { ...products[0]!, id: "zero", status: "active" as const, stock: 0 };
  for (const sort of Object.keys(catalogSorts) as (keyof typeof catalogSorts)[]) {
    expect(filterCatalog([unavailable, zero, available], { ...emptyCatalogFilters, sort })[0]!.id).toBe("available");
  }
  expect(filterCatalog([unavailable, zero, available], { ...emptyCatalogFilters, hideOutOfStock: true }).map((product) => product.id)).toEqual(["available"]);
});
