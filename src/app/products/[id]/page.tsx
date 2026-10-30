import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { notFound } from "next/navigation";
import { ChevronRight, MessageCircle } from "lucide-react";
import { publicProductDetails } from "@/lib/public-product";
import { productConditionSchema, productHref } from "@/lib/product-links";
import { serializeJsonLd } from "@/lib/structured-data";
import { site, whatsappUrl } from "@/data/site";
import { formatINR } from "@/data/products";
import { ProductImage } from "@/components/shop/ProductImage";
import { ProductPrice, DiscountBadge } from "@/components/shop/ProductPrice";
import { ConditionBadge } from "@/components/shop/ConditionBadge";
import { CatalogCard } from "@/components/shop/CatalogCard";
import { AddToCartButton } from "@/components/cart/AddToCartButton";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const result = await publicProductDetails((await params).id);
  if (!result) return { title: "Product unavailable", robots: { index: false, follow: false } };
  const { product } = result;
  const description = product.description?.slice(0, 160) || `${product.name} for ${product.platform}, ${product.condition}. Listed at ${formatINR(product.price)}. View details and enquire with GamexChange.`;
  return { title: product.name, description, alternates: { canonical: productHref(product.id) }, openGraph: { title: product.name, description, url: productHref(product.id), images: [{ url: new URL(product.image.src, site.url).href, width: product.image.width, height: product.image.height, alt: product.name }] } };
}

export default async function ProductDetailsPage({ params }: Props) {
  const result = await publicProductDetails((await params).id);
  if (!result) notFound();
  const { product, related } = result;
  const details = [
    ["Platform", product.platform], ["Condition", product.condition], ["Category", product.category],
    ["Brand / publisher", product.brand], ["Edition / model", product.edition], ["Genre", product.genre],
    ["Format", product.format], ["Player modes", product.playModes?.join(", ")], ["Age rating", product.ageRating],
    ["Release year", product.releaseYear ? String(product.releaseYear) : undefined],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));
  const message = `Hi GamexChange, I'm interested in ${product.name} (${product.platform}, ${product.condition}), listed at ${formatINR(product.price)}. Please confirm availability, condition, included items and collection or delivery options.`;
  const jsonLd = {
    "@context": "https://schema.org", "@type": "Product", name: product.name,
    url: new URL(productHref(product.id), site.url).href,
    image: new URL(product.image.src, site.url).href,
    description: product.description || `${product.name} for ${product.platform}. Condition: ${product.condition}.`,
    category: product.category, itemCondition: productConditionSchema(product.condition),
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
    offers: { "@type": "Offer", url: new URL(productHref(product.id), site.url).href, price: product.price, priceCurrency: "INR", availability: "https://schema.org/InStock", itemCondition: productConditionSchema(product.condition), seller: { "@type": "Organization", name: site.name } },
  };

  return <main className="mx-auto max-w-7xl px-5 pb-14 pt-28 sm:px-8 sm:pt-32">
    <nav aria-label="Breadcrumb" className="mb-6 text-xs text-muted"><ol className="flex flex-wrap items-center gap-2"><li><Link href="/" className="inline-flex min-h-9 items-center hover:text-ink">Home</Link></li><li aria-hidden><ChevronRight className="size-3" /></li><li><Link href="/products" className="inline-flex min-h-9 items-center hover:text-ink">Shop</Link></li><li aria-hidden><ChevronRight className="size-3" /></li><li aria-current="page" className="min-w-0 break-words">{product.name}</li></ol></nav>
    <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12">
      <div className="min-w-0 lg:sticky lg:top-28"><div className="mx-auto flex aspect-square w-full max-w-[30rem] items-center justify-center rounded-3xl border border-line-strong bg-surface p-6 sm:p-10"><ProductImage product={product} priority presentation="catalog" sizes="(min-width: 1024px) 480px, (min-width: 640px) 448px, calc(100vw - 88px)" /></div></div>
      <section className="min-w-0" aria-labelledby="product-title">
        <div className="flex flex-wrap items-center gap-2"><ConditionBadge condition={product.condition} /><DiscountBadge product={product} /></div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-accent-text">{product.platform}</p>
        <h1 id="product-title" className="mt-2 break-words font-display text-3xl font-bold leading-tight sm:text-4xl">{product.name}</h1>
        {product.edition && <p className="mt-2 text-sm text-muted">{product.edition}</p>}
        <div className="mt-5"><ProductPrice product={product} className="text-3xl sm:text-4xl" /></div>
        <p className="mt-3 text-sm text-ok">Available in the shop</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2"><AddToCartButton product={product} /><Link href="/cart" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-line-strong px-4 font-display text-xs font-semibold text-accent-text hover:border-blue">View cart</Link></div>
        <a href={whatsappUrl(message)} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-accent-text hover:underline"><MessageCircle className="size-4" aria-hidden />Ask about this product<span className="sr-only"> on WhatsApp, opens in a new tab</span></a>
        <p className="mt-2 text-xs leading-5 text-muted">Confirm package contents, condition and collection or delivery with the team. Adding to cart does not reserve stock. Online checkout is currently test-only.</p>
        <div className="mt-7 border-t border-line pt-5"><h2 className="font-display text-lg font-bold">Product description</h2><p className="mt-3 whitespace-pre-line break-words text-sm leading-7 text-muted">{product.description || "The team has not added a detailed description for this item yet. Ask us about its condition, included accessories and compatibility before ordering."}</p></div>
        <details open className="mt-5 border-t border-line pt-2"><summary className="flex min-h-11 cursor-pointer items-center font-display text-base font-semibold">Product details</summary><dl className="mt-2 grid gap-x-5 sm:grid-cols-2">{details.map(([label, value]) => <div key={label} className="min-w-0 border-b border-line py-3"><dt className="text-xs text-muted">{label}</dt><dd className="mt-1 break-words text-sm font-medium">{value}</dd></div>)}</dl></details>
        <details className="mt-4 border-t border-line pt-2"><summary className="flex min-h-11 cursor-pointer items-center font-display text-base font-semibold">Before you buy</summary><p className="mt-2 text-sm leading-6 text-muted">Returns and warranty eligibility depend on the product and condition. Review our <Link href="/policies" className="text-accent-text underline">store policies</Link> and ask the team if anything is unclear.</p></details>
      </section>
    </div>
    {related.length > 0 && <section aria-labelledby="related-products" className="mt-12 border-t border-line pt-7"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><h2 id="related-products" className="font-display text-2xl font-bold">More to explore</h2><Link href="/products" className="inline-flex min-h-11 items-center text-sm text-accent-text hover:underline">Browse all gear</Link></div><ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{related.map((item) => <li key={item.id} className="min-w-0"><CatalogCard product={item} /></li>)}</ul></section>}
    <Script id="gamexchange-product-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
  </main>;
}
