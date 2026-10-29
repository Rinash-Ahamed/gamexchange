import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { GameZoneCards } from "@/components/zone/GameZoneCards";
import { ZoneEnquiryForm } from "@/components/zone/ZoneEnquiryForm";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionGate } from "@/components/ui/SectionGate";
import { AmbientLight } from "@/components/ui/AmbientLight";

export const metadata: Metadata = {
  title: "Game Zone",
  description: "PlayStation 5, PlayStation 4 and Logitech G29 racing in Coimbatore. Choose Solo, Duo or Trio hourly packages.",
  alternates: { canonical: "/game-zone" },
};

export default function GameZonePage() {
  return (
    <main>
      <AmbientLight />
      <PageHero title={<>Enter<br /><span className="text-gradient">the arena.</span></>}>
        Play on PS5 or PS4, or take the wheel with Logitech G29 racing. Choose a Solo, Duo or Trio session and bring your squad.
      </PageHero>

      <section data-tone="blue" aria-labelledby="price-h" className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
        <SectionHeading title={<span id="price-h">Pick your <span className="text-gradient">station.</span></span>}>
          Hourly package prices for one, two or three players. Check availability with the team before you visit.
        </SectionHeading>
        <div className="mt-8"><GameZoneCards /></div>
      </section>

      <SectionGate from="Pricing" to="Enquire" level={1} />
      <section data-tone="violet" aria-labelledby="enq-h" className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-16">
        <SectionHeading title={<span id="enq-h">Bring <span className="text-gradient">the squad.</span></span>} align="center" />
        <div className="mt-8"><ZoneEnquiryForm /></div>
      </section>
    </main>
  );
}
