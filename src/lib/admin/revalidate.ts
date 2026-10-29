import "server-only";

import { revalidatePath, updateTag } from "next/cache";
import { PUBLIC_BANNERS_TAG, PUBLIC_PRODUCTS_TAG } from "@/lib/public-cache";

const adminData = {
  inventory: { tag: PUBLIC_PRODUCTS_TAG, paths: ["/admin", "/admin/inventory", "/products", "/"] },
  categories: { tag: PUBLIC_PRODUCTS_TAG, paths: ["/admin", "/admin/categories", "/admin/inventory", "/products", "/"] },
  banners: { tag: PUBLIC_BANNERS_TAG, paths: ["/", "/admin/banners"] },
  services: { tag: null, paths: ["/admin", "/admin/services"] },
} as const;

/** Call only after a successful authorized admin mutation. */
export function refreshAdminData(resource: keyof typeof adminData) {
  const { tag, paths } = adminData[resource];
  if (tag) updateTag(tag);
  for (const path of paths) revalidatePath(path);
}
