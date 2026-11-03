import { expect, test } from "@playwright/test";
import { inventoryPhotos, inventoryPhotoOrder, inventoryPhotoSource } from "../../src/lib/inventory-photos";

const legacy = { imageSrc: "/example.webp", imageWidth: 500, imageHeight: 500 };
const stored = { ...legacy, imageVersion: "photo-version", imageStoragePath: "inventory-images/photo-version.webp" };

test("legacy inventory keeps its single photo and gallery uses its ordered cover", () => {
  expect(inventoryPhotos(legacy)).toEqual([legacy]);
  expect(inventoryPhotos({ ...legacy, images: [stored, legacy] })).toEqual([stored, legacy]);
  expect(inventoryPhotoSource("product-1", stored)).toBe("/api/inventory/product-1/image?v=photo-version");
  expect(inventoryPhotoSource("product-1", legacy)).toBe("/example.webp");
});

test("gallery order rejects missing, duplicate and foreign image references", () => {
  expect(inventoryPhotoOrder(["new:0", "existing:photo-version"], [stored], 1)).toEqual(["new:0", "existing:photo-version"]);
  for (const order of [[], ["new:2"], ["existing:other-product"], ["new:0", "new:0"], ["https://untrusted.example/image"], [1], Array.from({ length: 6 }, (_, index) => `new:${index}`)]) {
    expect(inventoryPhotoOrder(order, [stored], 1)).toBeNull();
  }
  expect(inventoryPhotoOrder(["existing:0"], [legacy], 0)).toEqual(["existing:0"]);
});
