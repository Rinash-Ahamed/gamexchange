import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { GameZoneRail } from "@/components/zone/GameZoneRail";
import { ZoneEnquiryForm } from "@/components/zone/ZoneEnquiryForm";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionGate } from "@/components/ui/SectionGate";
import { AmbientLight } from "@/components/ui/AmbientLight";
import { zoneStations } from "@/data/gamezone";

export const metadata: Metadata = {
  title: "Game Zone",
  description: "PlayStation 4 and PlayStation 5 sessions per head, plus an arcade Tekken tournament, in Coimbatore.",
  alternates: { canonical: "/game-zone" },
};

export default function GameZonePage() {
  return (
    <main>
      <AmbientLight />
      <PageHero title={<>Enter<br /><span className="text-gradient">the arena.</span></>}>
        Step into a space built for gamers, with consoles, big screens and a complimentary beverage with every PlayStation session.
      </PageHero>

      <section data-tone="violet" aria-label="Gallery" className="mx-auto max-w-7xl px-5 sm:px-8"><GameZoneRail pinned /></section>

      <SectionGate from="Gallery" to="Session pricing" level={1} />
      <section data-tone="blue" aria-labelledby="price-h" className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
        <SectionHeading title={<span id="price-h">Pick your <span className="text-gradient">station.</span></span>}>
          Rates are per head, as listed on our current site. Please reconfirm with the shop before you visit.
        </SectionHeading>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {zoneStations.map((s) => (
            <div key={s.id} className="metal lit rounded-3xl p-7" style={{ ["--glow" as string]: s.id === "ps5" ? "var(--accent-2)" : "var(--accent)" }}>
              <h3 className="font-display text-2xl font-bold uppercase">{s.name}</h3>
              <ul className="mt-6 space-y-3">
                {s.sessions?.map((x) => (
                  <li key={x.minutes} className="flex items-baseline justify-between border-b border-line pb-3">
                    <span className="text-muted">{x.minutes} minutes</span>
                    <span className="font-display text-3xl font-bold">₹{x.price}</span>
                  </li>
                ))}
                {s.entry && <li className="font-display text-xl font-bold">{s.entry}</li>}
              </ul>
              {s.perk && <p className="mt-5 text-sm text-muted">{s.perk}</p>}
            </div>
          ))}
        </div>
      </section>

      <SectionGate from="Pricing" to="Enquire" level={2} />
      <section data-tone="violet" aria-labelledby="enq-h" className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-16">
        <SectionHeading title={<span id="enq-h">Bring <span className="text-gradient">the squad.</span></span>} align="center" />
        <div className="mt-8"><ZoneEnquiryForm /></div>
      </section>
    </main>
  );
}
