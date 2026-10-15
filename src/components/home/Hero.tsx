"use client";

import { useRef } from "react";
import { m, useInView, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ControllerButton } from "@/components/ui/ControllerButton";
import { ControllerBack, ControllerBody, ControllerCallouts, ControllerControls } from "@/components/hero/ControllerArt";
import { useFinePointer, useMedia } from "@/lib/use-media";
import { site } from "@/data/site";

const d = (s: string) => ({ ["--d" as string]: s });

/**
 * Cinematic hero. Entry sequence is pure CSS (plays before hydration, never blocks LCP):
 * light rises → controller emerges → blue light travels across the shell → headline → buttons.
 * Afterwards: pointer parallax (desktop, CSS variables only) and a scroll-linked "exploded view"
 * (transform/opacity only, motion values — no React re-renders).
 */
export function Hero() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const frame = useRef(0);

  const live = useInView(section, { margin: "120px" });
  const fine = useFinePointer();
  const wide = useMedia("(min-width: 1024px)");
  const reduce = useReducedMotion();
  const explode = wide && fine && !reduce;

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end start"] });
  const rotX = useTransform(scrollYProgress, [0, 1], [0, explode ? 24 : 0]);
  const yBack = useTransform(scrollYProgress, [0, 1], [0, explode ? 90 : 0]);
  const yCtl = useTransform(scrollYProgress, [0, 1], [0, explode ? -110 : 0]);
  const sCtl = useTransform(scrollYProgress, [0, 1], [1, explode ? 1.1 : 1]);
  const fade = useTransform(scrollYProgress, [0, 0.7, 1], [1, 1, reduce ? 1 : 0.1]);
  const lift = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : wide ? -40 : -18]);

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!fine || reduce || e.pointerType !== "mouse") return;
    const { clientX, clientY, currentTarget } = e;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const r = currentTarget.getBoundingClientRect();
      stage.current?.style.setProperty("--px", String(((clientX - r.left) / r.width) * 2 - 1));
      stage.current?.style.setProperty("--py", String(((clientY - r.top) / r.height) * 2 - 1));
    });
  };
  const onPointerLeave = () => {
    cancelAnimationFrame(frame.current);
    stage.current?.style.setProperty("--px", "0");
    stage.current?.style.setProperty("--py", "0");
  };

  return (
    <section
      ref={section}
      data-live={live ? "true" : "false"}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative isolate flex min-h-dvh items-center overflow-clip pb-24 pt-24 sm:pt-28 lg:pb-12"
    >
      {/* ambient lighting */}
      <div aria-hidden className="anim-illuminate absolute inset-0 -z-10">
        <div className="absolute -left-1/4 -top-1/4 size-[70vmax] rounded-full bg-[radial-gradient(closest-side,var(--hero-wash-a),transparent)]" />
        <div className="absolute -bottom-1/4 -right-1/4 size-[65vmax] rounded-full bg-[radial-gradient(closest-side,var(--hero-wash-b),transparent)]" />
        <div className="hud-grid absolute inset-0" />
        <div className="absolute inset-0" style={{ background: "var(--hero-vignette)" }} />
      </div>

      <div className="mx-auto grid w-full max-w-7xl items-center gap-2 px-5 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6.6fr)] lg:gap-4">
        {/* copy */}
        <div className="relative z-10 order-2 lg:order-1">
          <p className="anim-rise flex items-center gap-3 font-display text-[11px] font-semibold uppercase tracking-[0.35em] text-accent-text sm:text-xs" style={d("0.5s")}>
            <span aria-hidden className="h-px w-8 bg-current opacity-60" />
            Coimbatore · Gaming hub
          </p>
          <h1 className="mt-5 font-display text-[clamp(2.7rem,12.4vw,4.4rem)] font-bold uppercase leading-[0.9] tracking-tight sm:text-[clamp(3.4rem,9vw,5.6rem)] lg:text-[clamp(3.2rem,5.6vw,6.2rem)]">
            <span className="anim-rise block" style={d("0.62s")}>Your game.</span>
            <span className="anim-rise text-gradient block pb-[0.08em]" style={d("0.78s")}>Your rules.</span>
          </h1>
          <p className="anim-rise mt-5 font-display text-[13px] font-medium uppercase tracking-[0.14em] text-muted min-[400px]:text-[15px] sm:text-lg sm:tracking-[0.2em]" style={d("0.98s")}>
            {site.tagline}
          </p>
          <div className="anim-rise mt-8 flex flex-wrap gap-3 sm:gap-4" style={d("1.15s")}>
            <ControllerButton href="/products" glyph="x" size="lg" magnetic>Explore gear</ControllerButton>
            <ControllerButton href="/game-zone" glyph="o" size="lg" variant="ghost" magnetic>Enter game zone</ControllerButton>
          </div>
          <ul className="anim-rise mt-9 hidden flex-wrap gap-x-7 gap-y-2 text-sm text-muted sm:flex" style={d("1.35s")}>
            <li><span className="font-display font-semibold text-ink">2</span> branches</li>
            <li>Repairs in <span className="font-display font-semibold text-ink">{site.repairTurnaround}</span></li>
            <li><span className="font-display font-semibold text-ink">PS4 · PS5</span> · Arcade</li>
          </ul>
        </div>

        {/* stage */}
        <div className="order-1 lg:order-2">
          <div ref={stage} className="hero-stage relative mx-auto aspect-[840/500] w-full max-w-[60rem] [perspective:1400px] lg:-mr-8 lg:w-[calc(100%+2rem)] lg:max-w-none min-[1536px]:-mr-24 min-[1536px]:w-[calc(100%+6rem)]">
            <div aria-hidden className="stage-pool anim-illuminate absolute inset-x-[2%] bottom-[-6%] top-[30%]" style={d("0.2s")} />
            <div aria-hidden className="spot anim-illuminate absolute inset-x-[10%] -top-[14%] bottom-[8%]" style={d("0.1s")} />
            <div aria-hidden className="absolute inset-x-[2%] bottom-[0%] top-[58%] [perspective:900px]">
              <div className="stage-ring absolute inset-x-[6%] inset-y-0 opacity-70" />
              <div className="stage-ring stage-ring-dash absolute inset-x-[16%] inset-y-[14%] opacity-60" />
            </div>

            <m.div style={{ opacity: fade, y: lift }} className="absolute inset-0">
              <div className="anim-emerge absolute inset-0" style={d("0.3s")}>
                <div className="hero-float absolute inset-0">
                  <m.div style={{ rotateX: rotX }} className="absolute inset-0 [transform-style:preserve-3d]">
                    <div className="ctl-tilt absolute inset-0">
                      <m.div style={{ y: yBack }} className="absolute inset-0"><div className="pl pl-back absolute inset-0"><ControllerBack /></div></m.div>
                      <div className="pl pl-body absolute inset-0"><ControllerBody /></div>
                      <m.div style={{ y: yCtl, scale: sCtl }} className="absolute inset-0"><div className="pl pl-ctl absolute inset-0"><ControllerControls /></div></m.div>
                      <ControllerCallouts />
                    </div>
                  </m.div>
                </div>
              </div>
            </m.div>
          </div>
        </div>
      </div>

      <div aria-hidden className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.35em] text-muted lg:flex">
        Scroll
        <span className="h-10 w-px overflow-hidden bg-line"><span className="block size-full animate-[scan_2.4s_ease-in-out_infinite] bg-blue" /></span>
      </div>
    </section>
  );
}
