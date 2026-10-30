import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { formatINR, type Product } from "@/data/products";
import { whatsappUrl } from "@/data/site";
import { ProductImage } from "./ProductImage";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { ConditionBadge } from "./ConditionBadge";
import { DiscountBadge, ProductPrice } from "./ProductPrice";
import { productHref } from "@/lib/product-links";

export function CatalogCard({ product, priority = false, eager = false }: { product: Product; priority?: boolean; eager?: boolean }) {
  const message = `Hi GamexChange, I'm interested in ${product.name} (${product.platform}, ${product.condition}) at ${formatINR(product.price)}. Please confirm availability and included accessories.`;
  return <article className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-line-strong bg-surface transition-colors hover:border-blue" aria-labelledby={`catalog-${product.id}`}>
    <Link href={productHref(product.id)} prefetch={false} aria-label={`View ${product.name} details`} className="absolute inset-0 z-10 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[var(--focus-ring)]" />
    <div className="flex flex-wrap items-center gap-1.5 px-2.5 pt-2.5"><ConditionBadge condition={product.condition} /><DiscountBadge product={product} /></div>
    <div className="relative mx-2 mt-2 flex h-36 items-center justify-center overflow-hidden rounded-xl bg-surface-2 p-2 sm:h-40 2xl:h-44">
      <ProductImage product={product} priority={priority} eager={eager} presentation="catalog" sizes="(min-width: 1280px) 220px, (min-width: 1024px) 24vw, (min-width: 600px) 30vw, 45vw" />
    </div>
    <div className="flex flex-1 flex-col gap-1.5 px-2.5 pb-2.5 pt-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">{product.platform}</p>
      <h3 id={`catalog-${product.id}`} className="line-clamp-2 min-h-9 break-words font-display text-[13px] font-semibold leading-[1.125rem] group-hover:text-accent-text">{product.name}</h3>
      {product.edition && <p className="line-clamp-1 text-[11px] text-muted">{product.edition}</p>}
      <div className="mt-auto pt-1.5"><ProductPrice product={product} className="text-lg sm:text-xl" /></div>
      <AddToCartButton product={product} />
      <a href={whatsappUrl(message)} target="_blank" rel="noopener noreferrer" aria-label={`Enquire about ${product.name} on WhatsApp (opens in a new tab)`} className="relative z-20 inline-flex min-h-11 items-center justify-center gap-1 px-2 text-[11px] font-semibold text-accent-text hover:underline">Enquire<ArrowUpRight className="size-3 shrink-0" aria-hidden /></a>
    </div>
  </article>;
}
