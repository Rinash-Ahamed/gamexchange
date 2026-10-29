import { Hero } from "@/components/home/Hero";
import { Suspense } from "react";
import { BannerPlaceholder, HomeBanners, HomeFaqs, HomeShelf } from "@/components/home/HomeData";
import { Services } from "@/components/home/Services";
import { TradeTeaser } from "@/components/home/TradeTeaser";
import { RepairTeaser } from "@/components/home/RepairTeaser";
import { Reviews } from "@/components/home/Reviews";
import { FinalCta } from "@/components/home/FinalCta";
import { GameZoneCards } from "@/components/zone/GameZoneCards";
import { SectionGate } from "@/components/ui/SectionGate";
import { AmbientLight } from "@/components/ui/AmbientLight";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ControllerButton } from "@/components/ui/ControllerButton";
import { listPublicProducts } from "@/lib/admin/db";
import { listPublicBanners } from "@/lib/admin/banners";
import { listPublicFaqs } from "@/lib/admin/faqs";

export const dynamic = "force-dynamic";

export default function Home() {
  const products = listPublicProducts();
  const banners = listPublicBanners();
  const faqs = listPublicFaqs();
  return (
    <main>
      <AmbientLight />
      <Hero />
      <Suspense fallback={<BannerPlaceholder />}><HomeBanners data={banners} /></Suspense>
      <SectionGate from="Intro" to="Services" level={1} />
      <Services />
      <SectionGate from="Services" to="The shelf" level={2} />
      <section data-tone="blue" aria-labelledby="shelf-h" className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading title={<span id="shelf-h">Pre-owned consoles.<br /><span className="text-gradient">From our shelf.</span></span>}>
          Prices and trade-in figures are as listed on our current site. Message the shop to confirm what’s in stock.
        </SectionHeading>
        <div className="mt-8"><Suspense fallback={<div aria-label="Loading available consoles" className="min-h-[30rem] rounded-3xl bg-surface/40" />}><HomeShelf data={products} /></Suspense></div>
      </section>
      <SectionGate from="The shelf" to="Trade-in" level={3} />
      <TradeTeaser />
      <SectionGate from="Trade-in" to="Repairs" level={4} />
      <RepairTeaser />
      <SectionGate from="Repairs" to="Game zone" level={5} />
      <section data-tone="violet" aria-labelledby="zone-h" className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <SectionHeading title={<span id="zone-h">Enter<br /><span className="text-gradient">the arena.</span></span>}>
            PlayStation 5, PlayStation 4 and Logitech G29 racing, with Solo, Duo and Trio hourly packages.
          </SectionHeading>
          <ControllerButton href="/game-zone" glyph="tri" size="lg">Discover</ControllerButton>
        </div>
        <GameZoneCards />
      </section>
      <Reviews />
      <Suspense fallback={<div aria-label="Loading frequently asked questions" className="mx-auto min-h-80 max-w-4xl" />}><HomeFaqs data={faqs} /></Suspense>
      <FinalCta />
    </main>
  );
}
