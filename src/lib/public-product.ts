import "server-only";

import { cache } from "react";
import { listPublicProducts } from "@/lib/admin/db";
import { availableCatalog } from "@/lib/catalog";
import { productSection } from "@/data/catalog";
import type { Product } from "@/data/products";

/** Use the same public visibility boundary as the shop, never private inventory lookups. */
export const publicProductDetails = cache(async (id: string) => {
  if (!/^[a-zA-Z0-9-]{1,128}$/.test(id)) return null;
  const catalog = availableCatalog(await listPublicProducts());
  const product = catalog.find((item) => item.id === id);
  if (!product) return null;
  const score = (item: Product) => Number(item.platform === product.platform) * 3 + Number(item.category === product.category) * 2 + Number(productSection(item) === productSection(product));
  const related = catalog.filter((item) => item.id !== id && score(item) > 0).toSorted((a, b) => score(b) - score(a)).slice(0, 5);
  return { product, related };
});
