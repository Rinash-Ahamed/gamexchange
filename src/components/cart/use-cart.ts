"use client";

import { useSyncExternalStore } from "react";
import { CART_LIMIT, parseCart, type CartItem } from "@/lib/cart";

const KEY = "gx-cart-v1";
const empty = { items: [] as CartItem[], ready: false, persistent: true };
let snapshot = empty;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());
function restore() {
  try {
    const raw = localStorage.getItem(KEY);
    snapshot = { items: raw && raw.length < 16000 ? parseCart(JSON.parse(raw)) : [], ready: true, persistent: true };
  } catch { snapshot = { ...snapshot, ready: true, persistent: false }; }
}
function onStorage(event: StorageEvent) {
  if (event.storageArea === localStorage && (event.key === KEY || event.key === null)) { restore(); emit(); }
}
function subscribe(listener: () => void) {
  if (!listeners.size) {
    if (!snapshot.ready) restore();
    window.addEventListener("storage", onStorage);
  }
  listeners.add(listener);
  return () => { listeners.delete(listener); if (!listeners.size) window.removeEventListener("storage", onStorage); };
}
function save(items: CartItem[]) {
  let persistent = true;
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { persistent = false; }
  snapshot = { items, ready: true, persistent };
  emit();
}
export function useCart() {
  const state = useSyncExternalStore(subscribe, () => snapshot, () => empty);
  return {
    ...state,
    count: state.items.reduce((sum, item) => sum + item.quantity, 0),
    add(id: string, max: number) {
      const existing = snapshot.items.find((item) => item.id === id);
      if (!existing && snapshot.items.length >= CART_LIMIT) return;
      const quantity = Math.min(99, max, (existing?.quantity ?? 0) + 1);
      if (quantity < 1) return;
      save(existing ? snapshot.items.map((item) => item.id === id ? { id, quantity } : item) : [...snapshot.items, { id, quantity }]);
    },
    setQuantity(id: string, quantity: number) { save(parseCart(snapshot.items.map((item) => item.id === id ? { id, quantity } : item))); },
    remove(id: string) { save(snapshot.items.filter((item) => item.id !== id)); },
    complete(purchased: CartItem[]) {
      save(parseCart(snapshot.items.map((item) => ({ ...item, quantity: item.quantity - (purchased.find((entry) => entry.id === item.id)?.quantity ?? 0) }))));
    },
  };
}
