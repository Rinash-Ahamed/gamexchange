"use client";

import { useRef } from "react";
import { m, useReducedMotion, useScroll, useTransform } from "motion/react";

/**
 * Signature moment B: "level transition". A gate between sections: the finished level
 * fades out, a beam draws across, a flare passes, and the next level's title arrives.
 * Transform + opacity only. On touch/small screens the flare is dropped.
 */
export function SectionGate({ from, to, level }: { from: string; to: string; level: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start 100%", "end 0%"] });

  const beam = useTransform(p, [0.15, 0.5], [0, 1]);
  const outOpacity = useTransform(p, [0.2, 0.42], [1, 0]);
  const outY = useTransform(p, [0.2, 0.42], [0, reduce ? 0 : -18]);
  const inOpacity = useTransform(p, [0.4, 0.62], [0, 1]);
  const inY = useTransform(p, [0.4, 0.62], [reduce ? 0 : 22, 0]);
  const flareX = useTransform(p, [0.3, 0.7], ["-120%", "120%"]);
  const flareO = useTransform(p, [0.3, 0.5, 0.7], [0, 1, 0]);
  const num = String(level).padStart(2, "0");

  return (
    <div ref={ref} aria-hidden className="relative mx-auto h-28 max-w-7xl px-5 sm:h-32 sm:px-8">
      <div className="absolute inset-x-5 top-1/2 h-px -translate-y-1/2 bg-line sm:inset-x-8" />
      <m.div style={{ scaleX: beam }} className="absolute inset-x-5 top-1/2 h-px origin-left -translate-y-1/2 bg-gradient-to-r from-fill via-fill-2 to-transparent sm:inset-x-8" />
      <m.div style={{ x: flareX, opacity: flareO }} className="absolute inset-x-5 top-1/2 hidden h-24 -translate-y-1/2 sm:inset-x-8 pinned:block">
        <div className="mx-auto h-full w-1/3 bg-[radial-gradient(closest-side,var(--accent),transparent)] opacity-40 blur-xl" />
      </m.div>

      <m.p style={{ opacity: outOpacity, y: outY }} className="absolute left-5 top-[calc(50%-1.9rem)] font-display text-[11px] font-semibold uppercase tracking-[0.3em] text-muted sm:left-8">
        {from} · complete
      </m.p>
      <m.div style={{ opacity: inOpacity, y: inY }} className="absolute right-5 top-[calc(50%+0.6rem)] text-right sm:right-8">
        <p className="font-display text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-text">Level {num}</p>
        <p className="font-display text-2xl font-bold uppercase leading-none sm:text-4xl">{to}</p>
      </m.div>
    </div>
  );
}
