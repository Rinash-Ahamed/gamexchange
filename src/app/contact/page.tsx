import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { ContactForm } from "@/components/zone/ContactForm";
import { ControllerButton } from "@/components/ui/ControllerButton";
import { branches, mapsUrl, site, whatsappUrl } from "@/data/site";
import { businessDetails } from "@/data/legal";

export const metadata: Metadata = {
  title: "Contact & branches",
  description: "Find GameXchange at Sungam Bypass Rd, Karumbukkadai and Pollachi. Open 10 AM to 8 PM, all days. Get directions or contact our team.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <main>
      <PageHero title={<>Find us.<br /><span className="text-gradient">Say hello.</span></>}>
        Visit Sungam Bypass Rd, Karumbukkadai or Pollachi. Message on WhatsApp, call, or drop in.
      </PageHero>

      <div className="mx-auto grid max-w-7xl gap-6 px-5 sm:px-8 lg:grid-cols-[1fr_1.1fr]">
        <section id="stores" aria-label="Our stores" className="scroll-mt-28 space-y-5">
          {branches.map((b) => (
            <section key={b.id} aria-labelledby={`${b.id}-h`} className="metal rounded-3xl p-7">
              <h2 id={`${b.id}-h`} className="font-display text-2xl font-bold uppercase">{b.name}</h2>
              <p className="mt-1 text-muted">{b.area}</p>
              <p className="mt-4 text-sm">{site.hours.display} ({site.hours.days})</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <ControllerButton href={mapsUrl(b)} external glyph="sq" size="sm" variant="ghost">Directions</ControllerButton>
              </div>
            </section>
          ))}
          <div className="metal rounded-3xl p-7">
            <h2 className="font-display text-2xl font-bold uppercase">Fastest reply</h2>
            <p className="mt-1 text-muted">WhatsApp is the quickest way to reach the shop.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ControllerButton href={whatsappUrl("Hi GameXchange!")} external glyph="x" size="sm">WhatsApp</ControllerButton>
              <ControllerButton href={`tel:${businessDetails.phone}`} glyph="tri" size="sm" variant="ghost">Call our team</ControllerButton>
              <ControllerButton href={site.social.instagram} external glyph="o" size="sm" variant="ghost">Instagram</ControllerButton>
              <ControllerButton href={site.social.facebook} external glyph="o" size="sm" variant="ghost">Facebook</ControllerButton>
            </div>
          </div>
        </section>
        <ContactForm />
      </div>
    </main>
  );
}
