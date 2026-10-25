import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Disc3, Gamepad2, Headphones, Joystick, Repeat, Wrench } from "lucide-react";
import { whatsappUrl } from "@/data/site";
import { LightCard } from "@/components/ui/LightCard";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ControllerButton } from "@/components/ui/ControllerButton";

const offerings = [
  { title: "Shop consoles", description: "Find your next console. Ask us about available models and bundles.", action: "Browse consoles", href: "/products", icon: Gamepad2, image: "/promos/console-arrivals.png" },
  { title: "Games on disc", description: "Looking for your next game? Ask us about titles for your console.", action: "Ask about games", href: "/contact", icon: Disc3, image: "/promos/disc-vault.png" },
  { title: "Controllers & accessories", description: "Find controllers, headsets and the extras your setup needs.", action: "Explore gear", href: "/products", icon: Headphones, image: "/promos/setup-upgrades.png" },
  { title: "Sell or trade in", description: "Turn your current console into cash or put its value towards an upgrade.", action: "Get a trade-in quote", href: "/exchange", icon: Repeat, image: "/hero/gamexchange-hardware-stage.png" },
  { title: "Console & controller repairs", description: "Power faults, HDMI issues, stick drift or broken buttons. Tell us what needs fixing.", action: "Book a repair", href: "/repair-service", icon: Wrench, image: "/images/game-zone/controller-station.png" },
  { title: "Play at the game zone", description: "Drop in for PlayStation sessions, arcade games and multiplayer with friends.", action: "See the game zone", href: "/game-zone", icon: Joystick, image: "/images/game-zone/multiplayer-station.png" },
] as const;

export function Services() {
  return (
    <section data-tone="blue" aria-labelledby="services-h" className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
      <SectionHeading title={<span id="services-h">Gear. Service.<br /><span className="text-gradient">Zero downtime.</span></span>}>
        One shop for buying, selling, exchanging and repairing the hardware you play on.
      </SectionHeading>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {offerings.map((s, i) => {
          const Icon = s.icon;
          return (
            <Reveal as="li" key={s.title} delay={(i % 4) * 0.06}>
              <LightCard className="metal h-full rounded-3xl">
                <Link href={s.href} className="service-offering relative isolate flex h-full min-h-72 flex-col overflow-hidden rounded-3xl p-6 text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-blue/60">
                  <Image src={s.image} alt="" fill sizes="(min-width: 1280px) 400px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="service-offering-image -z-20 object-cover" />
                  <span aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(4,8,18,0.28)_0%,rgba(4,8,18,0.65)_38%,rgba(4,8,18,0.97)_100%)]" />
                  <span className="flex items-start justify-between gap-4">
                    <span className="grid size-11 place-items-center rounded-2xl border border-white/25 bg-black/35 text-white"><Icon className="size-5" aria-hidden /></span>
                    <ArrowUpRight className="size-5 text-white/80 transition-transform duration-200 motion-safe:group-hover:-translate-y-1 motion-safe:group-hover:translate-x-1" aria-hidden />
                  </span>
                  <h3 className="mt-auto pt-5 font-display text-lg font-bold uppercase leading-tight tracking-wide">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/80">{s.description}</p>
                  <span className="mt-4 font-display text-xs font-semibold uppercase tracking-wider text-white">{s.action} <span aria-hidden>↗</span></span>
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
