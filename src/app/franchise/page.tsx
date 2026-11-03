import type { Metadata } from "next";
import { Store } from "lucide-react";
import { Suspense } from "react";
import { FranchiseVideo } from "@/components/franchise/FranchiseVideo";
import { FranchiseGallery } from "@/components/franchise/FranchiseGallery";
import { PresenceCarousel } from "@/components/franchise/PresenceCarousel";
import { PageHero } from "@/components/ui/PageHero";
import { ControllerButton } from "@/components/ui/ControllerButton";
import { franchiseLocations } from "@/data/franchise";
import { whatsappUrl } from "@/data/site";

export const metadata: Metadata = {
  title: "Franchise opportunities",
  description: "Bring GamexChange to your city. Explore our store spaces and locations, and speak to the team about a franchise opportunity.",
  alternates: { canonical: "/franchise" },
};

export const dynamic = "force-dynamic";

const enquiry = whatsappUrl("Hi GamexChange, I would like to enquire about a franchise. My preferred city / area is: \nDo I have a premises in mind? \nPlease share the requirements, investment details and next steps.");

export default function FranchisePage() {
  return <main>
    <PageHero title={<>Your city.<br /><span className="text-gradient">Our next level.</span></>}>
      Bring GamexChange to your city. Explore our spaces and start a conversation about becoming a franchise partner.
    </PageHero>

    <div className="mx-auto max-w-7xl space-y-14 px-5 pb-10 sm:px-8 sm:space-y-20">
      <section aria-labelledby="franchise-intro" className="grid items-center gap-7 lg:grid-cols-2 lg:gap-12">
        <div className="min-w-0">
          <h2 id="franchise-intro" className="font-display text-3xl font-bold uppercase leading-tight sm:text-4xl">A place to play.<br /><span className="text-gradient">A space to connect.</span></h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted">From gaming gear to shared gaming experiences, get a closer look at the GamexChange store environment. Interested in a location of your own? Tell us where you would like to bring the brand.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <ControllerButton href={enquiry} external glyph="x" size="md" className="w-full min-w-0 text-xs tracking-normal sm:w-auto">Enquire about a franchise</ControllerButton>
            <ControllerButton href="#our-spaces" variant="ghost" glyph="sq" size="md">Explore our spaces</ControllerButton>
          </div>
          <p className="mt-4 text-xs leading-5 text-muted">Investment, space requirements, availability and partnership terms are confirmed directly by the team.</p>
        </div>
        <FranchiseVideo />
      </section>

      <section id="our-spaces" aria-labelledby="spaces-heading" className="scroll-mt-28">
        <div className="mb-6 max-w-2xl"><h2 id="spaces-heading" className="font-display text-3xl font-bold uppercase">Inside <span className="text-gradient">GamexChange.</span></h2><p className="mt-3 leading-7 text-muted">A look at our stores and gaming lounges. Layouts and facilities vary by location.</p></div>
        <Suspense fallback={<div role="status" className="min-h-64 rounded-2xl border border-line bg-surface p-6 text-sm text-muted">Loading store photos...</div>}><FranchiseGallery /></Suspense>
      </section>

      <section aria-labelledby="locations-heading" className="grid items-center gap-7 lg:grid-cols-2 lg:gap-12">
        <div className="min-w-0"><h2 id="locations-heading" className="font-display text-3xl font-bold uppercase">Our <span className="text-gradient">presence.</span></h2><p className="mt-3 leading-7 text-muted">Explore the locations in our network. Contact the team to confirm store details or discuss your preferred area.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {franchiseLocations.map(({ city, areas }) => <section key={city} aria-label={city} className="rounded-2xl border border-line-strong bg-surface p-5"><h3 className="flex items-center gap-2 font-display text-lg font-bold"><Store className="size-4 text-accent-text" aria-hidden />{city}</h3><ul className="mt-3 space-y-2 text-sm leading-6 text-muted">{areas.map((area) => <li key={area}>{area}</li>)}</ul></section>)}
          </div>
        </div>
        <PresenceCarousel />
      </section>

      <section aria-labelledby="franchise-enquiry" className="rounded-3xl border border-line-strong bg-surface p-6 sm:p-9">
        <div className="grid items-center gap-6 lg:grid-cols-[1fr_auto]"><div className="min-w-0"><h2 id="franchise-enquiry" className="font-display text-2xl font-bold uppercase sm:text-3xl">Let&apos;s talk about <span className="text-gradient">your city.</span></h2><p className="mt-3 max-w-2xl leading-7 text-muted">Share your preferred city, locality and whether you have a premises in mind. Our team can discuss suitability and the next steps with you.</p></div><ControllerButton href={enquiry} external glyph="x" size="md" className="w-full min-w-0 text-xs tracking-normal sm:w-auto">Start a franchise enquiry</ControllerButton></div>
        <p className="mt-4 text-xs leading-5 text-muted">Opens WhatsApp with a draft message. Your enquiry is sent only when you choose to send it.</p>
      </section>
    </div>
  </main>;
}
