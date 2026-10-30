import { normalizeCondition } from "@/data/catalog";

export const productHref = (id: string) => `/products/${encodeURIComponent(id)}`;

export function productConditionSchema(condition: string) {
  switch (normalizeCondition(condition)) {
    case "New": return "https://schema.org/NewCondition";
    case "Pre-Owned": return "https://schema.org/UsedCondition";
    case "Refurbished": return "https://schema.org/RefurbishedCondition";
    default: return undefined;
  }
}
