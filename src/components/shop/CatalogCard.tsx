import { ArrowUpRight } from "lucide-react";
import { formatINR, type Product } from "@/data/products";
import { whatsappUrl } from "@/data/site";
import { ProductImage } from "./ProductImage";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { ConditionBadge } from "./ConditionBadge";
import { DiscountBadge, ProductPrice } from "./ProductPrice";

export function CatalogCard({ product, priority = false, eager = false }: { product: Product; priority?: boolean; eager?: boolean }) {
  const message = `Hi GamexChange, I'm interested in ${product.name} (${product.platform}, ${product.condition}) at ${formatINR(product.price)}. Please confirm availability and included accessories.`;
  return <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-line-strong bg-surface transition-colors hover:border-blue" aria-labelledby={`catalog-${product.id}`}>
    <div className="flex flex-wrap items-center gap-2 px-3 pt-3"><ConditionBadge condition={product.condition} /><DiscountBadge product={product} /></div>
    <div className="relative m-2 flex aspect-[4/5] max-h-72 items-center justify-center overflow-hidden rounded-xl bg-surface-2 p-2 sm:m-3 sm:p-3">
      <ProductImage product={product} priority={priority} eager={eager} presentation="catalog" sizes="(min-width: 1536px) 260px, (min-width: 1024px) 30vw, (min-width: 600px) 30vw, 45vw" />
    </div>
    <div className="flex flex-1 flex-col gap-2 px-3 pb-3 sm:px-4 sm:pb-4">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">{product.platform}</p>
      <h3 id={`catalog-${product.id}`} className="line-clamp-2 min-h-10 break-words font-display text-sm font-semibold leading-5 sm:text-base">{product.name}</h3>
      {product.edition && <p className="text-xs text-muted">{product.edition}</p>}
      {product.description && <p className="line-clamp-2 text-xs leading-relaxed text-muted">{product.description}</p>}
      <div className="mt-auto pt-2"><ProductPrice product={product} /></div>
      <AddToCartButton product={product} />
      <a href={whatsappUrl(message)} target="_blank" rel="noopener noreferrer" aria-label={`Enquire about ${product.name} on WhatsApp (opens in a new tab)`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-blue bg-fill/10 px-2 font-display text-xs font-semibold text-accent-text transition-colors hover:bg-fill hover:text-accent-ink">Enquire<ArrowUpRight className="size-4 shrink-0" aria-hidden /></a>
    </div>
  </article>;
}
