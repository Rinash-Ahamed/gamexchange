export const CART_LIMIT = 30;
export const QUANTITY_LIMIT = 99;
export type CartItem = { id: string; quantity: number };

/** Only identifiers and quantities are persisted. Prices always come from the server. */
export function parseCart(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];
  const items = new Map<string, CartItem>();
  for (const item of value.slice(0, CART_LIMIT)) {
    if (!item || typeof item !== "object" || typeof item.id !== "string" || !/^[a-zA-Z0-9-]{1,128}$/.test(item.id) ||
      !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > QUANTITY_LIMIT) continue;
    items.set(item.id, { id: item.id, quantity: item.quantity });
  }
  return [...items.values()];
}
