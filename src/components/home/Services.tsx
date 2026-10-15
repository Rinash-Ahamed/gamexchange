import { Cpu, Gamepad2, Glasses, MessageSquare, Monitor, Plug, Repeat, Wrench, type LucideIcon } from "lucide-react";
import { services } from "@/data/repair";
import { LightCard } from "@/components/ui/LightCard";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ControllerButton } from "@/components/ui/ControllerButton";

const icons: Record<(typeof services)[number]["icon"], LucideIcon> = {
  wrench: Wrench, gamepad: Gamepad2, cpu: Cpu, plug: Plug, repeat: Repeat, monitor: Monitor, glasses: Glasses, message: MessageSquare,
};

export function Services() {
  return (
    <section data-tone="blue" aria-labelledby="services-h" className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
      <SectionHeading eyebrow="Everything gaming" title={<span id="services-h">Gear. Service.<br /><span className="text-gradient">Zero downtime.</span></span>}>
        One shop for buying, selling, exchanging and repairing the hardware you play on.
      </SectionHeading>

      <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((s, i) => {
          const Icon = icons[s.icon];
          return (
            <Reveal as="li" key={s.title} delay={(i % 4) * 0.06}>
              <LightCard className="metal h-full rounded-3xl p-6">
                <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-fill to-fill-2 text-accent-ink"><Icon className="size-6" aria-hidden /></span>
                <h3 className="mt-5 font-display text-lg font-bold uppercase leading-tight tracking-wide">{s.title}</h3>
              </LightCard>
            </Reveal>
          );
        })}
      </ul>

      <div className="mt-10 flex flex-wrap gap-4">
        <ControllerButton href="/repair-service" glyph="sq">Book a service</ControllerButton>
        <ControllerButton href="/exchange" glyph="tri" variant="ghost">Trade in</ControllerButton>
      </div>
    </section>
  );
}
