import { isPcComponentCategory } from "@/data/catalog";

type Availability = { stock?: number; status?: "active" | "draft" | "out-of-stock" };

export function canPurchaseProduct(product: Availability): boolean {
  return (product.status === undefined || product.status === "active") && (product.stock ?? 1) > 0;
}

export function isPublicInventory(product: { status: string; category: string }): boolean {
  return ["active", "out-of-stock"].includes(product.status) && !isPcComponentCategory(product.category);
}
