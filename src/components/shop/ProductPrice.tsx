import { formatINR } from "@/data/products";
import { productDiscount, type ProductPricing } from "@/lib/pricing";

export function DiscountBadge({ product }: { product: ProductPricing }) {
  const discount = productDiscount(product);
  return discount ? <span className="inline-flex items-center rounded-lg border border-ok bg-surface px-2.5 py-1.5 font-display text-[10px] font-bold uppercase leading-4 tracking-wide text-ok">{discount.label}% off</span> : null;
}

export function ProductPrice({ product, className = "text-xl sm:text-2xl", quantity = 1 }: { product: ProductPricing; className?: string; quantity?: number }) {
  const discount = productDiscount(product);
  return <div className="min-w-0">
    <p className={`break-words font-display font-bold tabular-nums ${className}`}><span className="sr-only">Selling price: </span>{formatINR(product.price * quantity)}</p>
    {discount && <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs leading-5"><span><span className="sr-only">Before discount: </span><s className="text-muted">{formatINR(discount.original * quantity)}</s></span><span className="font-semibold text-ok">Save {formatINR(discount.saving * quantity)} ({discount.label}%)</span></p>}
  </div>;
}
