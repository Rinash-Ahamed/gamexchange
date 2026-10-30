import { expect, test } from "@playwright/test";
import type { Product } from "@/data/products";
import { catalogFacets, consumerCatalogFacets, emptyCatalogFilters, filterCatalog } from "@/lib/catalog";

const base: Product = { id: "game-a", name: "Adventure A", platform: "PS5", category: "Game", shopSection: "games", condition: "Pre-Owned", price: 2000, originalPrice: 2500, brand: "Publisher A", genre: "Adventure", format: "Disc", edition: "Standard", playModes: ["Single-player", "Online multiplayer"], ageRating: "PEGI 12", releaseYear: 2026, tradeInVoucher: 0, tradeInCash: 0, image: { src: "/test.png", width: 300, height: 400 } };
const stock: Product[] = [base, { ...base, id: "game-b", name: "Racing B", platform: "PlayStation 4", brand: "Publisher B", genre: "Racing", price: 1000, originalPrice: 0, playModes: ["Local multiplayer"], releaseYear: 2024 }];

test("shop filters combine game metadata and multiple platforms", () => {
  expect(filterCatalog(stock, { ...emptyCatalogFilters, platforms: ["PlayStation 5", "PlayStation 4"] })).toHaveLength(2);
  expect(filterCatalog(stock, { ...emptyCatalogFilters, brands: ["Publisher A"], playModes: ["Online multiplayer"], ageRatings: ["PEGI 12"], years: ["2026"], editions: ["Standard"] }).map((product) => product.id)).toEqual(["game-a"]);
  expect(filterCatalog(stock, { ...emptyCatalogFilters, q: "ps5" })).toHaveLength(1);
});

test("facets count other selections without hiding their own alternatives", () => {
  const facets = catalogFacets(stock, { ...emptyCatalogFilters, platforms: ["PlayStation 5"] });
  expect(facets.find((facet) => facet.key === "platforms")?.options.find((option) => option.value === "PlayStation 4")?.count).toBe(1);
  expect(facets.find((facet) => facet.key === "brands")?.options.find((option) => option.value === "Publisher B")?.count).toBe(0);
  expect(facets.find((facet) => facet.key === "conditions")?.options.find((option) => option.value === "New")?.count).toBe(0);
});

test("empty metadata groups remain explainable and discount filtering is real", () => {
  expect(catalogFacets([], emptyCatalogFilters).some((facet) => facet.key === "genres" && facet.emptyMessage.length > 0)).toBe(true);
  expect(filterCatalog(stock, { ...emptyCatalogFilters, minDiscount: 20 }).map((product) => product.id)).toEqual(["game-a"]);
  expect(filterCatalog(stock, { ...emptyCatalogFilters, minDiscount: 30 })).toHaveLength(0);
});

test("consumer sidebar omits optional admin clutter and unavailable metadata", () => {
  const keys = consumerCatalogFacets(stock, emptyCatalogFilters).map((facet) => facet.key);
  expect(keys).toContain("genres");
  expect(keys).toContain("ageRatings");
  expect(keys).not.toContain("editions");
  expect(keys).not.toContain("brands");
  const hardware = [{ ...base, category: "Console", shopSection: "consoles" as const, brand: "Sony", genre: undefined, format: undefined, playModes: [], ageRating: undefined, releaseYear: 0 }];
  const hardwareKeys = consumerCatalogFacets(hardware, { ...emptyCatalogFilters, section: "consoles" }).map((facet) => facet.key);
  expect(hardwareKeys).toContain("brands");
  expect(hardwareKeys).not.toContain("genres");
});
