import { expect, test } from "@playwright/test";
import { products } from "../../src/data/products";
import { catalogSummary } from "../../src/lib/catalog-summary";
import { filterCatalog, emptyCatalogFilters } from "../../src/lib/catalog";
import { paginate } from "../../src/lib/pagination";

test("catalogue lists omit galleries/descriptions without changing filters or pricing", () => {
  const source = { ...products[0]!, description: "Detailed condition notes", images: [products[0]!.image, products[0]!.image] };
  const summary = catalogSummary(source);
  expect(summary).not.toHaveProperty("images");
  expect(summary).not.toHaveProperty("description");
  expect(summary.image).toEqual(source.image);
  expect(summary.price).toBe(source.price);
  expect(filterCatalog([summary], emptyCatalogFilters).map((product) => product.id)).toEqual([source.id]);
  expect(source.images).toHaveLength(2);
  expect(source.description).toBe("Detailed condition notes");
});

test("a large shop mounts a bounded result page", () => {
  const catalog = Array.from({ length: 2000 }, (_, index) => ({ ...products[0]!, id: `product-${index}` }));
  expect(paginate(catalog, 1).items).toHaveLength(20);
  expect(paginate(catalog, 100).items).toHaveLength(20);
  expect(paginate(catalog, 100).total).toBe(2000);
});
