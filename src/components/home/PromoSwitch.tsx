"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { usePageVisible } from "@/lib/use-page-visible";
import type { BannerSlide } from "@/data/banners";

export function PromoSwitch({ slides }: { slides: BannerSlide[] }) {
  const [active, setActive] = useState(0);
  const section = useRef<HTMLElement>(null);
  const inView = useInView(section, { margin: "120px" });
  const pageVisible = usePageVisible();
  const reduceMotion = useReducedMotion();
  const current = slides.length ? active % slides.length : 0;

  const move = (direction: number) => {
    if (slides.length < 2) return;
    setActive((current) => (current + direction + slides.length) % slides.length);
  };

  useEffect(() => {
    if (reduceMotion || slides.length < 2 || !inView || !pageVisible) return;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 2500);
    return () => window.clearInterval(timer);
  }, [reduceMotion, slides.length, inView, pageVisible]);

  if (!slides.length) return null;

  return (
    <section ref={section} data-live={inView && pageVisible ? "true" : "false"} className="promo-switch-section" aria-labelledby="promo-switch-heading">
      <h2 id="promo-switch-heading" className="mb-6 text-center font-display text-[clamp(1.8rem,4.5vw,3.5rem)] font-bold uppercase leading-tight tracking-tight sm:mb-8">
        The <span className="text-gradient-motion">Next Level.</span>
      </h2>
      <div className="promo-switch-console">
        <button className="promo-joycon promo-joycon-left" type="button" onClick={() => move(-1)} disabled={slides.length < 2} aria-label="Previous promotion">
          <span aria-hidden="true" className="promo-joycon-minus" />
          <span aria-hidden="true" className="promo-stick" />
          <span aria-hidden="true" className="promo-dpad"><i /><i /><i /><i /></span>
          <span aria-hidden="true" className="promo-capture" />
        </button>

        <div className="promo-switch-body">
          <div className="promo-switch-screen">
            {slides.map((slide, index) => (
              <article key={slide.id} className="promo-switch-slide" data-active={index === current ? "true" : "false"} aria-hidden={index !== current}>
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  sizes="(min-width: 1280px) 1120px, (min-width: 768px) 82vw, 88vw"
                  className="object-cover"
                  quality={85}
                  loading={inView && (index === current || index === (current + 1) % slides.length) ? "eager" : "lazy"}
                />
                {(slide.headline || slide.description) && <>
                  <div className="promo-switch-shade" />
                  <div className="promo-switch-copy">
                    {slide.headline && <h3>{slide.headline}</h3>}
                    {slide.description && <p>{slide.description}</p>}
                  </div>
                </>}
              </article>
            ))}
            <div className="promo-switch-dots" aria-hidden="true">
              {slides.map((slide, index) => (
                <span
                  key={slide.id}
                  data-active={index === current ? "true" : "false"}
                />
              ))}
            </div>
          </div>
        </div>

        <button className="promo-joycon promo-joycon-right" type="button" onClick={() => move(1)} disabled={slides.length < 2} aria-label="Next promotion">
          <span aria-hidden="true" className="promo-joycon-plus" />
          <span aria-hidden="true" className="promo-face-buttons"><i /><i /><i /><i /></span>
          <span aria-hidden="true" className="promo-stick" />
          <span aria-hidden="true" className="promo-home-button" />
        </button>
      </div>
    </section>
  );
}
