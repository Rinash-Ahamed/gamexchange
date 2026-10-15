"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { m, useScroll, useTransform } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { zoneImages, zoneStations } from "@/data/gamezone";

function ZoneImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <div role="img" aria-label={alt} className="size-full bg-gradient-to-br from-surface-2 to-surface" />;
  return <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 420px, 80vw" quality={80} onError={() => setFailed(true)} className="themed-img object-cover" />;
}

const items = [
  { type: "photo", i: 0 }, { type: "station", i: 1 }, { type: "photo", i: 1 }, { type: "station", i: 0 },
  { type: "photo", i: 2 }, { type: "station", i: 2 }, { type: "photo", i: 3 },
] as const;

function Slide({ it, idx }: { it: (typeof items)[number]; idx: number }) {
  const cls = "metal relative aspect-[4/5] w-[78vw] shrink-0 overflow-hidden rounded-3xl sm:w-[26rem]";
  if (it.type === "photo") {
    const img = zoneImages[it.i];
    return <div className={cls + " snap-start"}>{img && <ZoneImage src={img.src} alt={img.alt} />}</div>;
  }
  const s = zoneStations[it.i];
  if (!s) return null;
  return (
    <div key={idx} className={cls + " flex snap-start flex-col justify-between p-7"}>
      <div>
        <h3 className="font-display text-3xl font-bold uppercase leading-none">{s.name}</h3>
        <ul className="mt-6 space-y-3">
          {s.sessions?.map((x) => (
            <li key={x.minutes} className="flex items-baseline justify-between border-b border-line pb-3">
              <span className="text-muted">{x.minutes} min · per head</span>
              <span className="font-display text-2xl font-bold tabular-nums">₹{x.price}</span>
            </li>
          ))}
          {s.entry && <li className="font-display text-xl font-bold">{s.entry}</li>}
        </ul>
        {s.perk && <p className="mt-4 text-sm text-muted">{s.perk}</p>}
      </div>
    </div>
  );
}

/** Touch / small screen / reduced-motion: native scroll-snap rail with buttons and arrow keys. */
function NativeRail() {
  const rail = useRef<HTMLDivElement>(null);
  const { scrollXProgress } = useScroll({ container: rail });
  const slide = (dir: 1 | -1) => rail.current?.scrollBy({ left: dir * Math.min(rail.current.clientWidth * 0.8, 440), behavior: "smooth" });

  return (
    <div>
      <div
        ref={rail}
        tabIndex={0}
        role="region"
        aria-label="Game zone gallery, scroll horizontally"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") { e.preventDefault(); slide(1); }
          if (e.key === "ArrowLeft") { e.preventDefault(); slide(-1); }
        }}
        className="hide-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 pb-4 sm:-mx-8 sm:scroll-px-8 sm:px-8"
      >
        {items.map((it, idx) => <Slide key={idx} it={it} idx={idx} />)}
      </div>
      <div className="mt-4 flex items-center gap-4">
        <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-line" aria-hidden>
          <m.span style={{ scaleX: scrollXProgress }} className="absolute inset-0 origin-left bg-gradient-to-r from-fill to-fill-2" />
        </div>
        {([-1, 1] as const).map((d) => (
          <button key={d} type="button" onClick={() => slide(d)} aria-label={d === 1 ? "Next" : "Previous"} className="glass grid size-11 place-items-center rounded-full transition-transform active:scale-90 touch-manipulation">
            {d === 1 ? <ChevronRight className="size-5" aria-hidden /> : <ChevronLeft className="size-5" aria-hidden />}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Signature moment D. On desktop, vertical scroll drives the gallery sideways while the section is pinned. */
function PinnedRail() {
  const runway = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const maxX = useRef(0);

  useEffect(() => {
    const measure = () => {
      if (viewport.current && track.current) maxX.current = Math.max(0, track.current.scrollWidth - viewport.current.clientWidth);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    window.addEventListener("resize", measure, { passive: true });
    return () => { ro.disconnect(); window.removeEventListener("resize", measure); };
  }, []);

  const { scrollYProgress } = useScroll({ target: runway, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, (v) => -v * maxX.current);
  const bar = useTransform(scrollYProgress, [0, 1], [0.04, 1]);

  return (
    <div ref={runway} className="relative h-[300vh]">
      <div className="sticky top-0 flex h-dvh flex-col justify-center gap-8">
        <div ref={viewport} className="overflow-hidden">
          <m.div ref={track} style={{ x }} className="flex w-max gap-6 px-[max(2rem,calc((100vw-80rem)/2+2rem))] will-change-transform">
            {items.map((it, idx) => <Slide key={idx} it={it} idx={idx} />)}
          </m.div>
        </div>
        <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-8" aria-hidden>
          <span className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-muted">Scroll to explore</span>
          <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-line">
            <m.span style={{ scaleX: bar }} className="absolute inset-0 origin-left bg-gradient-to-r from-fill to-fill-2" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Both variants render; CSS (not JS) picks one, so there is no hydration swap or layout shift. */
export function GameZoneRail({ pinned = false }: { pinned?: boolean }) {
  if (!pinned) return <NativeRail />;
  return (
    <>
      <div className="pinned:hidden"><NativeRail /></div>
      <div className="hidden pinned:block"><PinnedRail /></div>
    </>
  );
}
