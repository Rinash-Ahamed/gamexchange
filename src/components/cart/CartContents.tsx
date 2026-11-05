"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { formatINR, type Product } from "@/data/products";
import { useCart } from "./use-cart";
import { ProductImage } from "@/components/shop/ProductImage";
import { TestCheckout } from "./TestCheckout";
import { ConditionBadge } from "@/components/shop/ConditionBadge";
import { DiscountBadge, ProductPrice } from "@/components/shop/ProductPrice";
import { productHref } from "@/lib/product-links";
import { canPurchaseProduct } from "@/lib/product-availability";

export function CartContents({ products, checkoutEnabled }: { products: Product[]; checkoutEnabled: boolean }) {
  const cart = useCart();
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState("");
  const productById = useMemo(() => {
    const index = new Map<string, Product>();
    for (const product of products) if (!index.has(product.id)) index.set(product.id, product);
    return index;
  }, [products]);
  const lines = cart.items.map((item) => ({ ...item, product: productById.get(item.id) }));
  const invalid = lines.some((line) => !line.product || !canPurchaseProduct(line.product) || line.quantity > (line.product.stock ?? 1));
  const total = lines.reduce((sum, line) => sum + (line.product?.price ?? 0) * 100 * line.quantity, 0);
  if (!cart.ready) return <p role="status" className="min-h-60 text-muted">Loading your cart...</p>;
  return <>
    {receipt && <section role="status" className="mb-6 rounded-2xl border border-ok/30 bg-ok/10 p-5"><h2 className="font-display text-xl font-semibold">Test payment verified</h2><p className="mt-2 break-all text-sm">Reference: {receipt}</p><p className="mt-2 text-sm text-muted">This was a simulation. No real money was collected, no stock was reserved and no delivery was booked.</p></section>}
    {!cart.persistent && <p role="status" className="mb-4 text-sm text-muted">Browser storage is unavailable. Your cart may reset when you leave this page.</p>}
    {!lines.length ? <div className="rounded-2xl border border-line-strong bg-surface p-8 text-center"><h2 className="font-display text-xl font-semibold">Your cart is empty.</h2><p className="mt-2 text-sm text-muted">Add games, consoles or accessories from the shop.</p><Link href="/products" className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-fill px-5 font-display text-sm font-semibold text-accent-ink">Explore the shop</Link></div> : <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <fieldset disabled={busy} className="min-w-0 space-y-3"><legend className="sr-only">Cart items</legend>
        {lines.map(({ id, quantity, product }, index) => <article key={id} className="grid min-w-0 grid-cols-[5rem_minmax(0,1fr)] items-start gap-3 rounded-2xl border border-line-strong bg-surface p-3 sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:gap-5 sm:p-5">
          {product && <div className="col-span-2 row-start-1 flex max-w-full flex-wrap justify-end gap-2 sm:col-span-1 sm:col-start-3"><ConditionBadge condition={product.condition} /><DiscountBadge product={product} /></div>}
          {product && <div className="col-start-1 row-start-2 size-20 rounded-xl bg-surface-2 p-2 sm:row-span-2 sm:row-start-1 sm:size-28"><ProductImage product={product} eager={index < 3} presentation="catalog" sizes="112px" /></div>}
          <div className="col-start-2 row-start-2 min-w-0 sm:row-span-2 sm:row-start-1"><h2 className="break-words font-display text-sm font-semibold sm:text-base">{product ? <Link href={productHref(product.id)} prefetch={false} className="hover:text-accent-text">{product.name}</Link> : "Item no longer available"}</h2>
            {product && <><p className="mt-1 text-xs text-muted">{product.platform}</p><div className="mt-2"><ProductPrice product={product} quantity={quantity} className="text-base" /></div></>}
            {(!product || !canPurchaseProduct(product) || quantity > (product.stock ?? 1)) && <p role="alert" className="mt-2 text-xs text-danger">{!product ? "Remove this item before continuing." : !canPurchaseProduct(product) ? "Out of stock. Remove this item to continue checkout." : `Only ${product.stock ?? 1} available. Reduce the quantity to continue.`}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <div role="group" aria-label={`Quantity for ${product?.name ?? id}`} className="inline-flex items-center rounded-xl border border-line-strong">
                <button type="button" disabled={quantity <= 1} aria-label={`Reduce quantity of ${product?.name ?? id}`} onClick={() => cart.setQuantity(id, quantity - 1)} className="grid size-11 place-items-center disabled:opacity-40"><Minus className="size-4" aria-hidden /></button>
                <span aria-live="polite" className="min-w-7 text-center text-sm tabular-nums">{quantity}</span>
                <button type="button" disabled={!product || !canPurchaseProduct(product) || quantity >= Math.min(99, product.stock ?? 1)} aria-label={`Increase quantity of ${product?.name ?? id}`} onClick={() => cart.setQuantity(id, quantity + 1)} className="grid size-11 place-items-center disabled:opacity-40"><Plus className="size-4" aria-hidden /></button>
              </div>
              <button type="button" onClick={() => cart.remove(id)} aria-label={`Remove ${product?.name ?? id} from cart`} className="inline-flex min-h-11 items-center gap-1 rounded-xl px-2 text-xs text-danger"><Trash2 className="size-4" aria-hidden />Remove</button>
            </div>
          </div>
        </article>)}
      </fieldset>
      <aside className="min-w-0 rounded-2xl border border-line-strong bg-surface p-5 lg:sticky lg:top-28">
        <h2 className="font-display text-xl font-bold">Your loadout</h2><p className="mt-3 text-sm text-muted">{cart.count} {cart.count === 1 ? "item" : "items"}</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4"><span className="text-sm">Product subtotal</span><span className="font-display text-2xl font-bold">{formatINR(total / 100)}</span></div>
        <p className="mt-2 text-xs leading-5 text-muted">Prices and availability are checked again at checkout. Delivery and additional charges are not calculated here.</p>
        {invalid && <p role="alert" className="mt-3 text-sm text-danger">Update unavailable items before continuing.</p>}
        <TestCheckout enabled={checkoutEnabled} items={cart.items} amount={total} disabled={invalid || total <= 0} onBusy={setBusy} onSuccess={(reference, purchased) => { setReceipt(reference); cart.complete(purchased); }} />
        <Link href="/products" className="mt-3 inline-flex min-h-11 w-full items-center justify-center text-sm text-muted underline">Continue shopping</Link>
      </aside>
    </div>}
  </>;
}
