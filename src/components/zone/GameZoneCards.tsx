import Image from "next/image";
import { zoneStations } from "@/data/gamezone";
import { ZoneRates } from "./ZoneRates";
import { imageLoading } from "@/lib/image-loading";

/** Three static station cards: imagery and prices together, without carousel controls. */
export function GameZoneCards({ aboveFold = false }: { aboveFold?: boolean }) {
  return (
    <div className="grid gap-4 md:grid-cols-3" aria-label="Game zone stations">
      {zoneStations.map((station) => (
        <article
          key={station.id}
          data-zone-station={station.id}
          aria-labelledby={`zone-${station.id}-heading`}
          className="relative isolate flex min-h-[26rem] min-w-0 flex-col overflow-hidden rounded-3xl border border-line-strong bg-[#080d1b] text-white [--ink:#f5f7ff] [--muted:#c2cbdd] [--line:rgba(255,255,255,0.18)]"
        >
          <Image src={station.image} alt="" fill sizes="(min-width: 1280px) 400px, (min-width: 768px) 32vw, 92vw" quality={80} {...imageLoading(aboveFold ? "visible" : "deferred")} className="-z-20 object-cover opacity-75" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-[#080d1b]/35 via-[#080d1b]/70 to-[#080d1b]" />
          <div className="flex flex-1 flex-col p-5 sm:p-6">
            <h3 id={`zone-${station.id}-heading`} className="break-words font-display text-2xl font-bold uppercase leading-tight">{station.name}</h3>
            <div aria-hidden className="min-h-16 flex-1" />
            <div className="pt-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/75">Hourly packages</p>
              <ZoneRates station={station} />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
