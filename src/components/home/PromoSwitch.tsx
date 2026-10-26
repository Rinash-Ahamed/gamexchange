"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

const slides = [
  {
    title: "New worlds. Fresh drops.",
    copy: "Explore the latest adventures landing at GameXChange.",
    action: "See new releases",
    image: "/promos/neon-rush.png",
    href: "/products",
  },
  {
    title: "The disc vault is open.",
    copy: "Build your physical game library with new and pre-owned favourites.",
    action: "Browse game discs",
    image: "/promos/disc-vault.png",
    href: "/products",
  },
  {
    title: "Console arrivals.",
    copy: "Power up with fresh hardware, controllers and complete bundles.",
    action: "Shop consoles",
    image: "/promos/console-arrivals.png",
    href: "/products",
  },
  {
    title: "Classics, replayed.",
    copy: "Rediscover retro systems, cartridges and couch co-op favourites.",
    action: "Find classics",
    image: "/promos/retro-replay.png",
    href: "/products",
  },
  {
    title: "Upgrade every move.",
    copy: "Controllers, headsets and accessories made for longer sessions.",
    action: "Explore accessories",
    image: "/promos/setup-upgrades.png",
    href: "/products",
  },
] as const;

export function PromoSwitch() {
  const [active, setActive] = useState(0);
  const touchStart = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();

  const move = (direction: number) => {
    setActive((current) => (current + direction + slides.length) % slides.length);
  };

  useEffect(() => {
    if (reduceMotion) return;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 2000);
    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  return (
    <section className="promo-switch-section" aria-labelledby="promo-switch-heading">
      <h2 id="promo-switch-heading" className="mb-6 text-center font-display text-[clamp(1.8rem,4.5vw,3.5rem)] font-bold uppercase leading-tight tracking-tight sm:mb-8">
        The <span className="text-gradient-motion">Next Level.</span>
      </h2>
      <div className="promo-switch-console">
        <button className="promo-joycon promo-joycon-left" type="button" onClick={() => move(-1)} aria-label="Previous promotion">
          <span aria-hidden="true" className="promo-joycon-minus" />
          <span aria-hidden="true" className="promo-stick" />
          <span aria-hidden="true" className="promo-dpad"><i /><i /><i /><i /></span>
          <span aria-hidden="true" className="promo-capture" />
        </button>

        <div className="promo-switch-body">
          <div
            className="promo-switch-screen"
            onTouchStart={(event) => { touchStart.current = event.touches[0]?.clientX ?? null; }}
            onTouchEnd={(event) => {
              if (touchStart.current === null) return;
              const distance = (event.changedTouches[0]?.clientX ?? touchStart.current) - touchStart.current;
              if (Math.abs(distance) > 44) move(distance > 0 ? -1 : 1);
              touchStart.current = null;
            }}
          >
            {slides.map((slide, index) => (
              <article key={slide.title} className="promo-switch-slide" data-active={index === active ? "true" : "false"} aria-hidden={index !== active}>
                <Image
                  src={slide.image}
                  alt=""
                  fill
                  sizes="(min-width: 1280px) 1120px, (min-width: 768px) 82vw, 88vw"
                  className="object-cover"
                  priority={index === 0}
                />
                <div className="promo-switch-shade" />
                <div className="promo-switch-copy">
                  <h3>{slide.title}</h3>
                  <p>{slide.copy}</p>
                  <Link href={slide.href} tabIndex={index === active ? 0 : -1}>
                    {slide.action}<span aria-hidden="true"> ↗</span>
                  </Link>
                </div>
              </article>
            ))}
            <div className="promo-switch-dots" aria-label="Choose promotion">
              {slides.map((slide, index) => (
                <button
                  key={slide.title}
                  type="button"
                  aria-label={`Show promotion ${index + 1}`}
                  aria-current={index === active ? "true" : undefined}
                  onClick={() => setActive(index)}
                />
              ))}
            </div>
          </div>
        </div>

        <button className="promo-joycon promo-joycon-right" type="button" onClick={() => move(1)} aria-label="Next promotion">
          <span aria-hidden="true" className="promo-joycon-plus" />
          <span aria-hidden="true" className="promo-face-buttons"><i /><i /><i /><i /></span>
          <span aria-hidden="true" className="promo-stick" />
          <span aria-hidden="true" className="promo-home-button" />
        </button>
      </div>
    </section>
  );
}
