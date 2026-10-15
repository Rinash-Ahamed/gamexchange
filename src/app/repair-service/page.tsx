import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { RepairExperience } from "@/components/zone/RepairExperience";
import { Accordion } from "@/components/ui/Accordion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { faqs } from "@/data/faq";
import { services } from "@/data/repair";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Console & controller repairs",
  description: "PlayStation consoles and controllers repaired in Coimbatore, including power faults, HDMI, analogue drift, buttons and more.",
  alternates: { canonical: "/repair-service" },
};

export default function RepairPage() {
  return (
    <main>
      <PageHero title={<>Game over?<br /><span className="text-gradient">Not yet.</span></>}>
        Pick the closest fault, tell us what’s happening, and the shop will come back to you. Repairs are listed as typically completed in {site.repairTurnaround}.
      </PageHero>
      <div className="mx-auto max-w-7xl px-5 sm:px-8"><RepairExperience /></div>

      <section aria-labelledby="svc-h" className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <SectionHeading title={<span id="svc-h">The full list</span>} />
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <li
              key={s.title}
              className="metal group relative overflow-hidden rounded-2xl px-5 py-4 font-display font-semibold uppercase tracking-wide transition-[transform,border-color,box-shadow] duration-300 ease-out motion-safe:hover:-translate-y-1 hover:border-blue/60 hover:[box-shadow:var(--shadow-card),0_18px_42px_-24px_var(--accent)]"
            >
              <span aria-hidden className="absolute inset-0 translate-y-full bg-gradient-to-t from-blue/15 via-violet/5 to-transparent transition-transform duration-300 ease-out motion-safe:group-hover:translate-y-0" />
              <span aria-hidden className="absolute -right-8 -top-8 size-20 scale-50 rounded-full bg-blue/20 opacity-0 blur-xl transition-[opacity,transform] duration-300 motion-safe:group-hover:scale-100 group-hover:opacity-100" />
              <span className="relative block transition-transform duration-300 ease-out motion-safe:group-hover:translate-x-1">{s.title}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="rfaq-h" className="mx-auto max-w-4xl px-5 sm:px-8">
        <SectionHeading title={<span id="rfaq-h">Before you book</span>} align="center" />
        <div className="mt-8"><Accordion items={faqs} /></div>
      </section>
    </main>
  );
}
