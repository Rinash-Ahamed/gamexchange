"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "./use-cart";

export function CartLink() {
  const { count } = useCart();
  return <Link href="/cart" aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`} className="relative grid size-11 shrink-0 place-items-center rounded-full border border-line-strong bg-surface text-accent-text hover:border-blue">
    <ShoppingCart className="size-5" aria-hidden />
    {count > 0 && <span aria-hidden className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-fill px-1 text-[10px] font-bold leading-5 text-accent-ink">{count > 99 ? "99+" : count}</span>}
  </Link>;
}
