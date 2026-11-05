"use client";

import { Check, ShoppingCart } from "lucide-react";
import type { Product } from "@/data/products";
import { CART_LIMIT } from "@/lib/cart";
import { useCart } from "./use-cart";
import { canPurchaseProduct } from "@/lib/product-availability";

export function AddToCartButton({ product }: { product: Product }) {
  const cart = useCart();
  const available = canPurchaseProduct(product);
  const quantity = cart.items.find((item) => item.id === product.id)?.quantity ?? 0;
  const max = Math.min(99, product.stock ?? 1);
  const full = quantity >= max || (!quantity && cart.items.length >= CART_LIMIT);
  if (!available) return <span className="relative z-20 inline-flex min-h-11 items-center justify-center rounded-xl border border-line-strong px-3 font-display text-xs font-semibold text-muted">Out of stock</span>;
  return <button type="button" disabled={!cart.ready || full || max < 1} onClick={() => { if (available) cart.add(product.id, max); }}
    aria-label={`${quantity ? "Add another" : "Add"} ${product.name} to cart${quantity ? ` (${quantity} in cart)` : ""}`}
    className="relative z-20 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-fill to-fill-2 px-3 font-display text-xs font-semibold text-accent-ink transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">
    {quantity ? <Check className="size-4 shrink-0" aria-hidden /> : <ShoppingCart className="size-4 shrink-0" aria-hidden />}
    {quantity ? `In cart (${quantity})` : "Add to cart"}
  </button>;
}
