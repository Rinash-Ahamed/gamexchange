import type { BannerSlide } from "@/data/banners";
import { PromoSwitch } from "./PromoSwitch";
import { Accordion } from "@/components/ui/Accordion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { PublicFaq } from "@/lib/admin/faqs";
import type { HomepageImages } from "@/data/homepage-images";
import { Services } from "./Services";
import { GameZoneCards } from "@/components/zone/GameZoneCards";

export async function HomeServices({ data }: { data: Promise<HomepageImages> }) {
  return <Services images={await data} />;
}
export async function HomeGameZone({ data }: { data: Promise<HomepageImages> }) {
  return <GameZoneCards images={await data} />;
}

export async function HomeFaqs({ data }: { data: Promise<PublicFaq[]> }) {
  const faqs = await data;
  if (!faqs.length) return null;
  return <section data-tone="blue" aria-labelledby="faq-h" className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
    <SectionHeading title={<span id="faq-h">Quick answers</span>} align="center" />
    <div className="mt-8"><Accordion items={faqs} /></div>
  </section>;
}

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
