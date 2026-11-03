import "server-only";

import { revalidatePath, updateTag } from "next/cache";
import { PUBLIC_BANNERS_TAG, PUBLIC_FAQS_TAG, PUBLIC_PRODUCTS_TAG } from "@/lib/public-cache";
import { HOMEPAGE_IMAGES_TAG } from "./homepage-images";
import { FRANCHISE_TAG } from "./franchise";

const adminData = {
  inventory: { tag: PUBLIC_PRODUCTS_TAG, paths: ["/admin", "/admin/inventory", "/products", "/cart", "/"] },
  categories: { tag: PUBLIC_PRODUCTS_TAG, paths: ["/admin", "/admin/categories", "/admin/inventory", "/products", "/cart", "/"] },
  banners: { tag: PUBLIC_BANNERS_TAG, paths: ["/", "/admin/banners"] },
  faqs: { tag: PUBLIC_FAQS_TAG, paths: ["/", "/admin/faqs"] },
  services: { tag: null, paths: ["/admin", "/admin/services"] },
  franchise: { tag: FRANCHISE_TAG, paths: ["/franchise", "/admin/franchise"] },
  homepageImages: { tag: HOMEPAGE_IMAGES_TAG, paths: ["/", "/game-zone", "/admin/homepage-services", "/admin/homepage-gamezone"] },
} as const;

/** Call only after a successful authorized admin mutation. */
export function refreshAdminData(resource: keyof typeof adminData) {
  const { tag, paths } = adminData[resource];
  if (tag) updateTag(tag);
  if (resource === "inventory" || resource === "categories") revalidatePath("/products/[id]", "page");
  if (resource === "inventory" || resource === "categories" || resource === "services") revalidatePath("/admin/activity");
  for (const path of paths) revalidatePath(path);
}
