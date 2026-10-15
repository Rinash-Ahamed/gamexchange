"use client";

import { useRef } from "react";
import { m, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ControllerButton } from "@/components/ui/ControllerButton";
import { site, whatsappUrl } from "@/data/site";

/** Signature moment E: a lightweight "press start" close with one pulsing ring and no heavy effects. */
export function FinalCta() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const ring = useTransform(scrollYProgress, [0, 1], [reduce ? 1 : 0.35, 1.25]);
  const ringO = useTransform(scrollYProgress, [0, 0.6, 1], [0, 0.7, 0.35]);
  return (
    <section ref={ref} data-tone="blue" aria-labelledby="cta-h" className="mx-auto max-w-7xl px-5 pb-6 pt-12 sm:px-8 sm:pt-16">
      <m.div
        initial={reduce ? false : { opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="metal relative isolate overflow-hidden rounded-[2rem] px-6 py-14 text-center sm:px-10 sm:py-20"
      >
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_120%,var(--hero-wash-a),transparent_65%)]" />
        <m.span aria-hidden style={{ scale: ring, opacity: ringO }} className="absolute left-1/2 top-1/2 -z-10 size-[min(34rem,120vw)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue/50 shadow-[0_0_80px_-10px_var(--accent)_inset]" />
        <p className="font-display text-xs font-semibold uppercase tracking-[0.4em] text-accent-text">Player one, ready?</p>
        <h2 id="cta-h" className="mt-4 font-display text-5xl font-bold uppercase leading-[0.9] sm:text-7xl lg:text-8xl">Press <span className="text-gradient">start.</span></h2>
        <p className="mx-auto mt-6 max-w-lg text-lg text-muted">{site.tagline} Two branches in Coimbatore, open {site.hours.display}, closed {site.hours.closedDay}s.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <ControllerButton href={whatsappUrl("Hi GamexChange!")} external glyph="x" size="lg" magnetic>Message us</ControllerButton>
          <ControllerButton href="/contact" glyph="o" size="lg" variant="ghost" magnetic>Find a branch</ControllerButton>
        </div>
      </m.div>
    </section>
  );
}
