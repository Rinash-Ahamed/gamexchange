import { Hero } from "@/components/home/Hero";
import { Suspense } from "react";
import { BannerPlaceholder, HomeBanners, HomeShelf } from "@/components/home/HomeData";
import { Services } from "@/components/home/Services";
import { TradeTeaser } from "@/components/home/TradeTeaser";
import { RepairTeaser } from "@/components/home/RepairTeaser";
import { Reviews } from "@/components/home/Reviews";
import { FinalCta } from "@/components/home/FinalCta";
import { GameZoneRail } from "@/components/zone/GameZoneRail";
import { SectionGate } from "@/components/ui/SectionGate";
import { AmbientLight } from "@/components/ui/AmbientLight";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ControllerButton } from "@/components/ui/ControllerButton";
import { Accordion } from "@/components/ui/Accordion";
import { faqs } from "@/data/faq";
import { listPublicProducts } from "@/lib/admin/db";
import { listPublicBanners } from "@/lib/admin/banners";

export const dynamic = "force-dynamic";

export default function Home() {
  const products = listPublicProducts();
  const banners = listPublicBanners();
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
            PlayStation 4 and 5 stations, an arcade Tekken tournament and a space built for gamers.
          </SectionHeading>
          <ControllerButton href="/game-zone" glyph="tri" size="lg">Discover</ControllerButton>
        </div>
        <GameZoneRail />
      </section>
      <Reviews />
      <section data-tone="blue" aria-labelledby="faq-h" className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
        <SectionHeading title={<span id="faq-h">Quick answers</span>} align="center" />
        <div className="mt-8"><Accordion items={faqs} /></div>
      </section>
      <FinalCta />
    </main>
  );
}
