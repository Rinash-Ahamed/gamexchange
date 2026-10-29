import type { BannerSlide } from "@/data/banners";
import type { Product } from "@/data/products";
import { PromoSwitch } from "./PromoSwitch";
import { ShelfShowcase } from "./ShelfShowcase";

export async function HomeBanners({ data }: { data: Promise<BannerSlide[]> }) {
  const banners = await data;
  return <PromoSwitch key={banners.map((banner) => `${banner.id}:${banner.image}`).join("|")} slides={banners} />;
}

export function BannerPlaceholder() {
  return (
    <div aria-hidden="true" className="promo-switch-section">
      <div className="mb-6 text-center font-display text-[clamp(1.8rem,4.5vw,3.5rem)] font-bold uppercase leading-tight tracking-tight sm:mb-8">The <span className="text-gradient-motion">Next Level.</span></div>
      <div className="promo-switch-console"><div className="promo-joycon promo-joycon-left" /><div className="promo-switch-body"><div className="promo-switch-screen" /></div><div className="promo-joycon promo-joycon-right" /></div>
    </div>
  );
}

export async function HomeShelf({ data }: { data: Promise<Product[]> }) {
  const products = await data;
  const featured = products.filter((product) => product.featured);
  const showcase = (featured.length ? featured : products).slice(0, 6);
  return showcase.length ? <ShelfShowcase products={showcase} /> : <p className="text-muted">No consoles are listed right now. Contact the shop for current availability.</p>;
}
