import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { ContactForm } from "@/components/zone/ContactForm";
import { ControllerButton } from "@/components/ui/ControllerButton";
import { branches, mapsUrl, site, whatsappUrl } from "@/data/site";

export const metadata: Metadata = {
  title: "Contact & branches",
  description: "Two GamexChange branches in Coimbatore: Sungam and Selvapuram South. Open 11:00 AM – 8:30 PM, closed Fridays.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <main>
      <PageHero title={<>Find us.<br /><span className="text-gradient">Say hello.</span></>}>
        Two branches in Coimbatore. Message on WhatsApp, call, or drop in.
      </PageHero>

      <div className="mx-auto grid max-w-7xl gap-6 px-5 sm:px-8 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-5">
          {branches.map((b) => (
            <section key={b.id} aria-labelledby={`${b.id}-h`} className="metal rounded-3xl p-7">
              <h2 id={`${b.id}-h`} className="font-display text-2xl font-bold uppercase">{b.name}</h2>
              <p className="mt-1 text-muted">{b.area}</p>
              <p className="mt-4 text-sm">{site.hours.display} · closed {site.hours.closedDay}s</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <ControllerButton href={`tel:${b.phone}`} glyph="tri" size="sm">{b.phoneDisplay}</ControllerButton>
                <ControllerButton href={mapsUrl(b)} external glyph="sq" size="sm" variant="ghost">Directions</ControllerButton>
              </div>
            </section>
          ))}
          <div className="metal rounded-3xl p-7">
            <h2 className="font-display text-2xl font-bold uppercase">Fastest reply</h2>
            <p className="mt-1 text-muted">WhatsApp is the quickest way to reach the shop.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ControllerButton href={whatsappUrl("Hi GamexChange!")} external glyph="x" size="sm">WhatsApp</ControllerButton>
              <ControllerButton href={site.social.instagram} external glyph="o" size="sm" variant="ghost">Instagram</ControllerButton>
              <ControllerButton href={site.social.facebook} external glyph="o" size="sm" variant="ghost">Facebook</ControllerButton>
            </div>
          </div>
        </div>
        <ContactForm />
      </div>
    </main>
  );
}
