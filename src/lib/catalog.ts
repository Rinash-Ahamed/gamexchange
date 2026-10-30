import type { Product } from "@/data/products";
import { gameFormats, genreSuggestions, isPcComponentCategory, normalizeCondition, normalizePlatform, platformSuggestions, playModeChoices, productConditions, productSection, type ShopSection } from "@/data/catalog";
import { productDiscount } from "@/lib/pricing";

export const catalogSorts = { featured: "Recommended", latest: "Newest arrivals", "price-asc": "Price: low to high", "price-desc": "Price: high to low", name: "Name: A to Z", "name-desc": "Name: Z to A", discount: "Biggest discount" } as const;
export type CatalogSort = keyof typeof catalogSorts;
export const catalogFacetKeys = ["platforms", "categories", "conditions", "brands", "genres", "formats", "editions", "playModes", "ageRatings", "years"] as const;
export type CatalogFacetKey = typeof catalogFacetKeys[number];
export type CatalogFilters = Record<CatalogFacetKey, string[]> & { section: ShopSection | "all"; q: string; min: string; max: string; sale: boolean; minDiscount: number; sort: CatalogSort };
export type CatalogFacet = { key: CatalogFacetKey; title: string; options: { value: string; count: number }[]; emptyMessage: string };
export const emptyCatalogFilters: CatalogFilters = { section: "all", q: "", platforms: [], categories: [], conditions: [], brands: [], genres: [], formats: [], editions: [], playModes: [], ageRatings: [], years: [], min: "", max: "", sale: false, minDiscount: 0, sort: "featured" };
export function hasDiscount(product: Product) { return productDiscount(product) !== null; }
export function availableCatalog(products: readonly Product[]) { return products.filter((product) => !isPcComponentCategory(product.category)); }
function matchesCatalog(product: Product, filters: CatalogFilters) {
  const terms = filters.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const min = filters.min.trim() === "" ? 0 : Math.max(0, Number(filters.min) || 0);
  const max = filters.max.trim() === "" ? Infinity : Math.max(0, Number(filters.max) || 0);
  if (filters.section !== "all" && productSection(product) !== filters.section) return false;
  if (filters.platforms.length && !filters.platforms.includes(normalizePlatform(product.platform))) return false;
  if (filters.categories.length && !filters.categories.includes(product.category)) return false;
  if (filters.conditions.length && !filters.conditions.includes(normalizeCondition(product.condition))) return false;
  if (filters.brands.length && !filters.brands.includes(product.brand ?? "")) return false;
  if (filters.genres.length && !filters.genres.includes(product.genre ?? "")) return false;
  if (filters.formats.length && !filters.formats.includes(product.format ?? "")) return false;
  if (filters.editions.length && !filters.editions.includes(product.edition ?? "")) return false;
  if (filters.playModes.length && !filters.playModes.some((mode) => product.playModes?.includes(mode))) return false;
  if (filters.ageRatings.length && !filters.ageRatings.includes(product.ageRating ?? "")) return false;
  if (filters.years.length && !filters.years.includes(String(product.releaseYear || ""))) return false;
  if (product.price < min || product.price > max || (filters.sale && !hasDiscount(product))) return false;
  if (filters.minDiscount > 0 && (productDiscount(product)?.percent ?? 0) < filters.minDiscount) return false;
  const text = [product.name, product.platform, normalizePlatform(product.platform).replace("PlayStation ", "PS"), product.category, product.genre, product.edition, product.brand].join(" ").toLowerCase();
  return terms.every((term) => text.includes(term));
}
export function filterCatalog(products: readonly Product[], filters: CatalogFilters) {
  const visible = products.filter((product) => matchesCatalog(product, filters));
  return visible.toSorted((a, b) => {
    switch (filters.sort) {
      case "latest": return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
      case "price-asc": return a.price - b.price;
      case "price-desc": return b.price - a.price;
      case "name": return a.name.localeCompare(b.name);
      case "name-desc": return b.name.localeCompare(a.name);
      case "discount": return (productDiscount(b)?.percent ?? 0) - (productDiscount(a)?.percent ?? 0);
      default: return Number(b.featured ?? false) - Number(a.featured ?? false);
    }
  });
}

function facetValues(product: Product, key: CatalogFacetKey): string[] {
  switch (key) {
    case "platforms": return [normalizePlatform(product.platform)];
    case "categories": return [product.category];
    case "conditions": return [normalizeCondition(product.condition)];
    case "brands": return [product.brand ?? ""];
    case "genres": return [product.genre ?? ""];
    case "formats": return [product.format ?? ""];
    case "editions": return [product.edition ?? ""];
    case "playModes": return product.playModes ?? [];
    case "ageRatings": return [product.ageRating ?? ""];
    case "years": return product.releaseYear ? [String(product.releaseYear)] : [];
  }
}

/** Counts respect other selections while keeping each facet's own choices visible. */
export function catalogFacets(products: readonly Product[], filters: CatalogFilters): CatalogFacet[] {
  const scoped = products.filter((product) => filters.section === "all" || productSection(product) === filters.section);
  const hasGames = scoped.some((product) => productSection(product) === "games");
  const defaults: Partial<Record<CatalogFacetKey, readonly string[]>> = { platforms: platformSuggestions, conditions: productConditions, genres: hasGames ? genreSuggestions : [], formats: hasGames ? gameFormats : [], playModes: hasGames ? playModeChoices : [] };
  const titles: Record<CatalogFacetKey, string> = { platforms: "Platforms", categories: "Categories", conditions: "Condition", brands: "Brand / publisher", genres: "Game genre", formats: "Game format", editions: "Edition / model", playModes: "Player modes", ageRatings: "Age rating", years: "Release year" };
  const gameKeys: CatalogFacetKey[] = ["genres", "formats", "playModes", "ageRatings", "years"];
  return catalogFacetKeys.filter((key) => filters.section === "all" || filters.section === "games" || !gameKeys.includes(key)).map((key) => {
    const counts = new Map<string, number>();
    const otherFilters = { ...filters, [key]: [] };
    for (const product of scoped) if (matchesCatalog(product, otherFilters)) {
      for (const value of new Set(facetValues(product, key))) if (value) counts.set(value, (counts.get(value) ?? 0) + 1);
    }
    const values = [...new Set([...(defaults[key] ?? []), ...scoped.flatMap((product) => facetValues(product, key)), ...filters[key]])].filter(Boolean).sort((a, b) => key === "years" ? Number(b) - Number(a) : a.localeCompare(b));
    return { key, title: titles[key], options: values.map((value) => ({ value, count: counts.get(value) ?? 0 })), emptyMessage: gameKeys.includes(key) && !hasGames ? "No game stock in this section yet." : "No published stock has this detail yet." };
  });
}

/** Keep the buying sidebar useful without displaying every optional admin attribute. */
export function consumerCatalogFacets(products: readonly Product[], filters: CatalogFilters) {
  const scoped = products.filter((product) => filters.section === "all" || productSection(product) === filters.section);
  const hasHardware = scoped.some((product) => productSection(product) !== "games");
  return catalogFacets(products, filters).filter((facet) => {
    if (filters[facet.key].length) return true;
    if (facet.key === "platforms" || facet.key === "conditions") return true;
    if (facet.key === "editions") return false;
    if (facet.key === "brands" && !hasHardware) return false;
    if (facet.key === "categories") return facet.options.length > 1;
    return scoped.some((product) => facetValues(product, facet.key).some(Boolean));
  }).map((facet) => facet.key === "brands" ? { ...facet, title: "Brand" } : facet);
}
