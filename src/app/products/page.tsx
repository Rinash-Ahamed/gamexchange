import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { ProductBrowser } from "@/components/shop/ProductBrowser";
import { products } from "@/data/products";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Shop consoles & gaming gear",
  description: "Pre-owned PlayStation consoles with listed prices and trade-in figures. Enquire on WhatsApp to confirm availability.",
  alternates: { canonical: "/products" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: products.map((p, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "Product",
      name: p.name,
      image: p.image.src,
      itemCondition: "https://schema.org/UsedCondition",
      offers: { "@type": "Offer", priceCurrency: "INR", price: p.price, seller: { "@type": "Organization", name: site.name } },
    },
  })),
};

export default function ProductsPage() {
  return (
    <main>
      <PageHero title={<>Choose<br /><span className="text-gradient">your gear.</span></>}>
        Pre-owned consoles from our shelf. Prices are as listed on our current site. Message the shop to confirm what’s available today.
      </PageHero>
      <div className="mx-auto max-w-7xl px-5 sm:px-8"><ProductBrowser /></div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </main>
  );
}
