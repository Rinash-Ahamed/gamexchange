import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHero } from "@/components/ui/PageHero";
import { ProductBrowser } from "@/components/shop/ProductBrowser";
import { site } from "@/data/site";
import { listPublicProducts } from "@/lib/admin/db";
import { normalizePlatform, shopSections } from "@/data/catalog";
import { availableCatalog, type CatalogFilters } from "@/lib/catalog";
import { productConditionSchema, productHref } from "@/lib/product-links";

export const metadata: Metadata = {
  title: "Shop games, consoles & accessories",
  description: "Browse available games, consoles, controllers and accessories. Filter by platform, condition and price, then enquire with GameXchange.",
  alternates: { canonical: "/products" },
};

export const dynamic = "force-dynamic";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [stock, query] = await Promise.all([listPublicProducts(), searchParams]);
  const products = availableCatalog(stock);
  const value = (key: string) => { const entry = query[key]; return (Array.isArray(entry) ? entry[0] ?? "" : entry ?? "").trim(); };
  const section = shopSections.find((entry) => entry.id === value("section"))?.id ?? "all";
  const category = products.find((product) => product.category.toLowerCase() === value("category").toLowerCase())?.category;
  const platform = products.find((product) => normalizePlatform(product.platform) === normalizePlatform(value("platform")))?.platform;
  const initialFilters: Partial<CatalogFilters> = { section, q: value("q").slice(0, 160), categories: category ? [category] : [], platforms: platform ? [normalizePlatform(platform)] : [] };
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: p.name,
        url: new URL(productHref(p.id), site.url).href,
        image: p.image.src,
        itemCondition: productConditionSchema(p.condition),
        offers: { "@type": "Offer", priceCurrency: "INR", price: p.price, seller: { "@type": "Organization", name: site.name } },
      },
    })),
  };

  return (
    <main>
      <PageHero title={<>Browse<br /><span className="text-gradient">products.</span></>}>
        Browse games, consoles and accessories. Choose your platform and filter by price, condition and category.
      </PageHero>
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8"><ProductBrowser key={JSON.stringify(initialFilters)} products={products} initialFilters={initialFilters} /></div>
      <JsonLd id="gamexchange-products-jsonld" data={jsonLd} />
    </main>
  );
}
