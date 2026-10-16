import Link from "next/link";
import { ArrowUpRight, Cpu, Gamepad2, Glasses, MessageSquare, Monitor, Plug, Repeat, Store, Wrench, type LucideIcon } from "lucide-react";
import { services } from "@/data/repair";
import { whatsappUrl } from "@/data/site";
import { LightCard } from "@/components/ui/LightCard";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ControllerButton } from "@/components/ui/ControllerButton";

const icons: Record<(typeof services)[number]["icon"], LucideIcon> = {
  wrench: Wrench, gamepad: Gamepad2, cpu: Cpu, plug: Plug, repeat: Repeat, monitor: Monitor, glasses: Glasses, message: MessageSquare, store: Store,
};

export function Services() {
  return (
    <section data-tone="blue" aria-labelledby="services-h" className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
      <SectionHeading title={<span id="services-h">Gear. Service.<br /><span className="text-gradient">Zero downtime.</span></span>}>
        One shop for buying, selling, exchanging and repairing the hardware you play on.
      </SectionHeading>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s, i) => {
          const Icon = icons[s.icon];
          return (
            <Reveal as="li" key={s.title} delay={(i % 4) * 0.06}>
              <LightCard className="metal h-full rounded-3xl">
                <Link href={s.href} className="flex h-full min-h-44 flex-col p-6 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue/30">
                  <span className="flex items-start justify-between gap-4">
                    <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-fill to-fill-2 text-accent-ink"><Icon className="size-6" aria-hidden /></span>
                    <ArrowUpRight className="size-5 text-muted transition-transform duration-200 group-hover:-translate-y-1 group-hover:translate-x-1" aria-hidden />
                  </span>
                  <h3 className="mt-auto pt-5 font-display text-lg font-bold uppercase leading-tight tracking-wide">{s.title}</h3>
                </Link>
              </LightCard>
            </Reveal>
          );
        })}
      </ul>

      <aside className="metal mt-6 flex flex-col gap-5 rounded-3xl p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-lg font-bold uppercase">Bring GamexChange to your city.</p>
          <p className="mt-1 max-w-2xl text-sm text-muted">Interested in a franchise opportunity? Tell us about your location and experience, and we will share the next steps.</p>
        </div>
        <ControllerButton
          href={whatsappUrl("Hi GamexChange, I would like to know more about your franchise opportunities.")}
          external
          glyph="tri"
          className="shrink-0"
        >
          Franchise enquiry
        </ControllerButton>
      </aside>

      <div className="mt-8 flex flex-wrap gap-4">
        <ControllerButton href="/repair-service" glyph="sq">Book a service</ControllerButton>
        <ControllerButton href="/exchange" glyph="tri" variant="ghost">Trade in</ControllerButton>
      </div>
    </section>
  );
}
