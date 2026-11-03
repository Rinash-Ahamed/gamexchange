"use client";

import Image from "next/image";
import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { imageLoading } from "@/lib/image-loading";
import { usePageVisible } from "@/lib/use-page-visible";

const slides = [
  { src: "/franchise/presence-network-v2.webp", name: "network illustration", alt: "Concept illustration connecting GamexChange's network cities: Coimbatore, Pollachi, Perundurai and Karur. Exact locations are listed alongside." },
  { src: "/franchise/presence-location-map-v2.webp", name: "location map", alt: "Owner-supplied GamexChange location artwork for Coimbatore, Pollachi, Perundurai and Karur. The locations are also listed in page text." },
] as const;

export function PresenceCarousel() {
  const container = useRef<HTMLElement>(null);
  const visible = useInView(container);
  const near = useInView(container, { once: true, margin: "200px" });
  const pageVisible = usePageVisible();
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [loaded, setLoaded] = useState([false, false]);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!visible || !pageVisible || reduce || paused || hovered || focused || !loaded.every(Boolean)) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 8000);
    return () => window.clearInterval(timer);
  }, [visible, pageVisible, reduce, paused, hovered, focused, loaded]);

  return (
    <figure ref={container} aria-label="GamexChange presence images" aria-roledescription="carousel"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
      className="min-w-0 overflow-hidden rounded-3xl border border-line-strong bg-[#050b25]">
      <div className="relative aspect-square">
        {slides.map((slide, index) => (index === 0 || near) && (
          <a key={slide.src} href={slide.src} target="_blank" rel="noopener noreferrer"
            aria-label={`Open the GamexChange ${slide.name} at full size in a new tab`}
            aria-hidden={index !== active} tabIndex={index === active ? 0 : -1}
            data-active={index === active ? "true" : "false"}
            className="presence-slide absolute inset-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-blue">
            <Image src={slide.src} alt={slide.alt} fill
              sizes="(min-width: 1280px) 580px, (min-width: 1024px) 46vw, 100vw"
              {...imageLoading(index === 0 ? "deferred" : "visible")}
              onLoad={() => setLoaded((previous) => previous[index] ? previous : previous.map((ready, i) => i === index || ready))}
              className="object-contain" />
          </a>
        ))}
      </div>
      <figcaption className="flex flex-wrap items-center justify-between gap-3 border-t border-white/15 px-4 py-3 text-sm text-white/75">
        <p className="min-w-0 flex-1 basis-48">Network overview and location artwork. Tap to view full size.</p>
        <div className="flex items-center gap-1">
          {slides.map((slide, index) => <button key={slide.src} type="button" aria-label={`Show ${slide.name}`} aria-pressed={active === index} disabled={!loaded[index]}
            onClick={() => { setActive(index); setPaused(true); }}
            className="grid size-11 place-items-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-white disabled:opacity-40">
            <span aria-hidden className={`h-2 rounded-full transition-[width,background-color] motion-reduce:transition-none ${active === index ? "w-5 bg-[#a9bfff]" : "w-2 bg-white/40"}`} />
          </button>)}
          {!reduce && <button type="button" onClick={() => setPaused((current) => !current)} aria-label={paused ? "Resume image rotation" : "Pause image rotation"}
            className="grid size-11 place-items-center rounded-full border border-white/20 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
            {paused ? <Play className="size-4" aria-hidden /> : <Pause className="size-4" aria-hidden />}
          </button>}
        </div>
      </figcaption>
    </figure>
  );
}
