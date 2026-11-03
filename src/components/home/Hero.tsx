"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, m, useInView, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ControllerButton } from "@/components/ui/ControllerButton";
import { usePageVisible } from "@/lib/use-page-visible";
import { site } from "@/data/site";
import { imageLoading } from "@/lib/image-loading";

const d = (s: string) => ({ ["--d" as string]: s });

const fiberTracks = [
  { color: "cyan", path: "M240-60C220 130 565 118 650 242S790 534 1110 584S1510 558 1720 710" },
  { color: "magenta", path: "M290-60C272 120 604 128 688 258S836 566 1140 612S1520 598 1720 748" },
  { color: "violet", path: "M340-60C326 112 642 138 728 274S886 600 1170 640S1530 638 1720 786" },
] as const;

const headlines = [
  { top: "Your game.", bottom: "Your rules." },
  { top: "Play more.", bottom: "Pay less." },
  { top: "Trade smart.", bottom: "Level up." },
  { top: "Game over?", bottom: "Not yet." },
] as const;

/**
 * Cinematic hero. Entry sequence is pure CSS (plays before hydration, never blocks LCP):
 * light rises → controller emerges → blue light travels across the shell → headline → buttons.
 * Afterwards: a small compositor-driven float and scroll-linked opacity, without
 * stacking scroll movement or perspective rocking on the raster artwork.
 */
export function Hero() {
  const section = useRef<HTMLElement>(null);
  const [headline, setHeadline] = useState(0);

  const live = useInView(section, { margin: "120px" });
  const reduce = useReducedMotion();
  const pageVisible = usePageVisible();

  useEffect(() => {
    if (reduce || !live || !pageVisible) return;

    const interval = window.setInterval(() => {
      setHeadline((current) => (current + 1) % headlines.length);
    }, 3200);

    return () => window.clearInterval(interval);
  }, [reduce, live, pageVisible]);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end start"] });
  const fade = useTransform(scrollYProgress, [0, 0.7, 1], [1, 1, reduce ? 1 : 0.1]);

  return (
    <section
      ref={section}
      data-live={live && pageVisible ? "true" : "false"}
      className="hero-section relative isolate flex min-h-dvh items-center overflow-clip pb-24 pt-24 sm:pt-28 lg:pb-12"
    >
      {/* ambient lighting */}
      <div aria-hidden className="anim-illuminate absolute inset-0 -z-10">
        <div className="absolute -left-1/4 -top-1/4 size-[70vmax] rounded-full bg-[radial-gradient(closest-side,var(--hero-wash-a),transparent)]" />
        <div className="absolute -bottom-1/4 -right-1/4 size-[65vmax] rounded-full bg-[radial-gradient(closest-side,var(--hero-wash-b),transparent)]" />
        <div className="absolute inset-0" style={{ background: "var(--hero-vignette)" }} />
      </div>
      <div aria-hidden className="hero-environment absolute inset-0 -z-10">
        <div className="hero-architecture hero-architecture-left" />
        <div className="hero-architecture hero-architecture-right" />
        <div className="hero-energy-trail hero-energy-trail-a" />
        <div className="hero-energy-trail hero-energy-trail-b" />
      </div>
      <svg aria-hidden className="hero-fibers absolute inset-0 z-0 size-full" viewBox="0 0 1600 900" preserveAspectRatio="none">
        <defs>
          <linearGradient id="hero-fiber-spectrum" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="var(--hero-fiber-violet)" />
            <stop offset="0.38" stopColor="var(--hero-fiber-cyan)" stopOpacity="0.3" />
            <stop offset="0.66" stopColor="var(--hero-fiber-cyan)" />
            <stop offset="1" stopColor="var(--hero-fiber-magenta)" />
          </linearGradient>
        </defs>
        {fiberTracks.map(({ color, path }) => (
          <g key={color} className={`hero-fiber-track hero-fiber-track-${color}`}>
            <path className="hero-fiber-bloom" d={path} />
            <path className="hero-fiber" d={path} />
            <path className={`hero-fiber-pulse hero-fiber-pulse-${color}`} pathLength="1" d={path} />
          </g>
        ))}
      </svg>

      <div className="mx-auto grid w-full max-w-7xl items-center gap-2 px-5 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7.2fr)] lg:gap-4">
        {/* copy */}
        <div className="relative z-10 order-2 lg:order-1">
          <h1 className="anim-rise font-display text-[clamp(2.7rem,12.4vw,4.4rem)] font-bold uppercase leading-[0.9] tracking-tight sm:text-[clamp(3.4rem,9vw,5.6rem)] lg:text-[clamp(3.2rem,5.6vw,6.2rem)]" style={d("0.62s")}>
            <span className="sr-only">Your game. Your rules.</span>
            <span aria-hidden className="block min-h-[1.88em]">
              <AnimatePresence mode="wait" initial={false}>
                <m.span
                  key={headline}
                  className="block"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className="block">{headlines[headline]?.top}</span>
                  <span className="text-gradient-motion block pb-[0.08em]">{headlines[headline]?.bottom}</span>
                </m.span>
              </AnimatePresence>
            </span>
          </h1>
          <p className="anim-rise mt-5 font-display text-[13px] font-medium uppercase tracking-[0.14em] text-muted min-[400px]:text-[15px] sm:text-lg sm:tracking-[0.2em]" style={d("0.98s")}>
            {site.tagline}
          </p>
          <nav aria-label="Quick actions" className="hero-cta-actions anim-rise mt-8" style={d("1.15s")}>
            <ControllerButton href="/products" glyph="x" size="lg" className="hero-cta">Shop</ControllerButton>
            <ControllerButton href="/exchange" glyph="sq" size="lg" variant="ghost" className="hero-cta">Sell &amp; Exchange</ControllerButton>
            <ControllerButton href="/repair-service" glyph="tri" size="lg" variant="ghost" className="hero-cta">Repairs</ControllerButton>
            <ControllerButton href="/game-zone" glyph="o" size="lg" variant="ghost" className="hero-cta">Game Zone</ControllerButton>
          </nav>
          <ul className="anim-rise mt-9 hidden flex-wrap gap-x-7 gap-y-2 text-sm text-muted sm:flex" style={d("1.35s")}>
            <li><span className="font-display font-semibold text-ink">2</span> branches</li>
            <li>Repairs in <span className="font-display font-semibold text-ink">{site.repairTurnaround}</span></li>
            <li><span className="font-display font-semibold text-ink">PS4 · PS5</span> · G29 Racing</li>
          </ul>
        </div>

        {/* stage */}
        <div className="order-1 min-w-0 lg:order-2">
          <div
            className="hero-stage hero-product-stage relative mx-auto aspect-[7/5] w-full max-w-[60rem] [perspective:1400px]"
          >
            <div aria-hidden className="hero-controller-aura absolute inset-[8%_-4%_0]" />
            <div aria-hidden className="hero-holo-rings absolute inset-0">
              <span className="hero-holo-ring hero-holo-ring-a" />
              <span className="hero-holo-ring hero-holo-ring-b" />
              <span className="hero-holo-ring hero-holo-ring-c" />
            </div>
            <div aria-hidden className="hero-arena-floor absolute inset-x-[4%] bottom-[-8%] top-[55%]" />
            <div aria-hidden className="hero-particles absolute inset-0">
              <span className="hero-particle hero-particle-a" />
              <span className="hero-particle hero-particle-b" />
              <span className="hero-particle hero-particle-c" />
              <span className="hero-particle hero-particle-d" />
              <span className="hero-particle hero-particle-e" />
              <span className="hero-particle hero-particle-f" />
              <span className="hero-particle hero-particle-g" />
              <span className="hero-particle hero-particle-h" />
            </div>
            <div aria-hidden className="stage-pool anim-illuminate absolute inset-x-[2%] bottom-[-6%] top-[30%]" style={d("0.2s")} />
            <div aria-hidden className="spot anim-illuminate absolute inset-x-[10%] -top-[14%] bottom-[8%]" style={d("0.1s")} />
            <div aria-hidden className="absolute inset-x-[2%] bottom-[0%] top-[58%] [perspective:900px]">
              <div className="stage-ring absolute inset-x-[6%] inset-y-0 opacity-70" />
              <div className="stage-ring stage-ring-dash absolute inset-x-[16%] inset-y-[14%] opacity-60" />
            </div>

            <m.div style={{ opacity: fade }} className="absolute inset-0">
              <div className="anim-emerge hero-product-enter absolute inset-0" style={d("0.3s")}>
                <div className="hero-product-float absolute">
                  <Image
                    src="/hero/gamexchange-hardware-stage.webp"
                    alt="Gaming console, controller, VR headset and handheld system on an illuminated display platform"
                    fill
                    {...imageLoading("critical")}
                    sizes="(min-width: 1536px) 880px, (min-width: 1280px) 680px, (min-width: 1024px) 54vw, (min-width: 640px) calc(100vw - 64px), calc(100vw - 40px)"
                    className="hero-product-art object-contain"
                  />
                </div>
              </div>
            </m.div>
          </div>
        </div>
      </div>

    </section>
  );
}
