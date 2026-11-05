import type { Product } from "@/data/products";

/** List views need cover/filter/pricing fields, not full detail-page content. */
export function catalogSummary(product: Product): Product {
  const summary = { ...product };
  delete summary.images;
  delete summary.description;
  return summary;
}
