import type { InventoryItem, InventoryStatus } from "./types";

export const stockFilters = [
  { value: "in-stock", label: "In stock" },
  { value: "low-stock", label: "Low stock (1 to 2)" },
  { value: "no-stock", label: "No stock" },
] as const;

export type InventoryFilters = {
  q: string;
  category: string;
  platform: string;
  status: InventoryStatus | "";
  stock: (typeof stockFilters)[number]["value"] | "";
};

export type InventorySearchParams = Partial<Record<keyof InventoryFilters | "notice" | "error" | "saved", string | string[]>>;

export function queryValue(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] ?? "" : value ?? "").trim();
}

function searchable(value: string) { return value.normalize("NFKC").toLocaleLowerCase("en"); }

export function filterInventory(items: InventoryItem[], filters: InventoryFilters) {
  const terms = searchable(filters.q).split(/\s+/).filter(Boolean);
  return items.filter((item) => {
    if (filters.category && item.categoryId !== filters.category) return false;
    if (filters.platform && item.platform !== filters.platform) return false;
    if (filters.status && item.status !== filters.status) return false;
    if (filters.stock === "in-stock" && item.stock <= 0) return false;
    if (filters.stock === "low-stock" && (item.stock < 1 || item.stock > 2)) return false;
    if (filters.stock === "no-stock" && item.stock !== 0) return false;
    if (!terms.length) return true;
    const text = searchable([item.name, item.sku, item.platform, item.category, item.condition].join(" "));
    return terms.every((term) => text.includes(term));
  });
}

export function groupInventory(items: InventoryItem[]) {
  const groups = new Map<string, { category: string; items: InventoryItem[] }>();
  for (const item of items) {
    const name = item.category.trim() || "Uncategorized";
    const key = item.categoryId ?? name.toLocaleLowerCase("en");
    const group = groups.get(key) ?? { category: name, items: [] };
    group.items.push(item);
    groups.set(key, group);
  }
  return [...groups.values()].sort((a, b) => a.category.localeCompare(b.category));
}
