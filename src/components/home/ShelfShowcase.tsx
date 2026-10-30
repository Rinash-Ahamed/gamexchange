"use client";

import { useRef, useState } from "react";
import { AnimatePresence, m, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { formatINR, type Product } from "@/data/products";
import { whatsappUrl } from "@/data/site";
import { ProductStage } from "@/components/shop/ProductStage";
import { ProductCard } from "@/components/shop/ProductCard";
import { ControllerButton } from "@/components/ui/ControllerButton";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { ConditionBadge } from "@/components/shop/ConditionBadge";
import { DiscountBadge, ProductPrice } from "@/components/shop/ProductPrice";

/**
 * Signature moment C: product spotlight. On desktop the section pins and scrolling advances
 * through the shelf (state changes only when the active product changes; the rest is CSS/motion
 * values). The rail buttons give direct keyboard/click access. On touch, small screens and
 * reduced-motion the same products render as a native swipe carousel instead (CSS-only switch).
 */
export function ShelfShowcase({ products }: { products: readonly Product[] }) {
  const n = products.length;
  const runway = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: runway, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const i = Math.min(n - 1, Math.max(0, Math.floor(v * n * 0.999)));
    setActive((cur) => (cur === i ? cur : i));
  });

  const goTo = (i: number) => {
    const el = runway.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + span * ((i + 0.5) / n), behavior: reduce ? "auto" : "smooth" });
  };

  const p = products[active] ?? products[0];
  if (!p) return null;
  const message = `Hi GamexChange, I'm interested in the ${p.name} (${p.condition}, listed at ${formatINR(p.price)}). Is it available?`;

  return (
    <>
      {/* swipe carousel: touch, small screens, reduced motion */}
      <ul className="hide-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 pinned:hidden sm:-mx-8 sm:px-8" aria-label="Pre-owned consoles">
        {products.map((x, i) => (
          <li key={x.id} className="w-[82vw] max-w-sm shrink-0 snap-start sm:w-80">
            <ProductCard product={x} index={i} total={n} />
          </li>
        ))}
      </ul>

      {/* pinned showcase: desktop with fine pointer */}
      <div ref={runway} className="relative hidden pinned:block" style={{ height: `${n * 85 + 40}vh` }}>
        <div className="sticky top-0 flex h-dvh items-center">
          <div className="grid w-full items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
            <div>
              <p className="font-display text-sm font-semibold tabular-nums tracking-[0.3em] text-muted">
                <span className="text-ink">{String(active + 1).padStart(2, "0")}</span> / {String(n).padStart(2, "0")}
              </p>
              <AnimatePresence mode="wait">
                <m.div key={p.id} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
                  <div className="mt-6 flex flex-wrap items-center gap-3"><span className="text-sm font-medium text-muted">{p.platform}</span><ConditionBadge condition={p.condition} /><DiscountBadge product={p} /></div>
                  <h3 className="mt-4 font-display text-5xl font-bold uppercase leading-[0.95] xl:text-6xl">{p.name}</h3>
                  <div className="mt-6"><ProductPrice product={p} className="text-6xl tracking-tight" /></div>
                  <dl className="mt-6 flex gap-8 text-sm">
                    <div><dt className="text-muted">Trade-in · voucher</dt><dd className="font-display text-xl font-semibold tabular-nums">{formatINR(p.tradeInVoucher)}</dd></div>
                    <div><dt className="text-muted">Trade-in · cash</dt><dd className="font-display text-xl font-semibold tabular-nums">{formatINR(p.tradeInCash)}</dd></div>
                  </dl>
                  <p className="mt-3 max-w-md text-xs text-muted">As listed on our current site. Confirm availability on WhatsApp; trade-in value is confirmed after the shop checks your device.</p>
                  <div className="mt-8 flex flex-wrap gap-4">
                    <AddToCartButton product={p} />
                    <ControllerButton href={whatsappUrl(message)} external glyph="x" size="lg">Enquire</ControllerButton>
                    <ControllerButton href="/products" glyph="sq" size="lg" variant="ghost">View all</ControllerButton>
                  </div>
                </m.div>
              </AnimatePresence>
            </div>

            <div className="relative">
              <div className="relative aspect-[5/4] w-full">
                <AnimatePresence mode="popLayout">
                  <m.div key={p.id} initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 1.06, y: -30 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-0">
                    <ProductStage product={p} priority={active === 0} sizes="55vw" className="size-full" />
                  </m.div>
                </AnimatePresence>
              </div>
              <ol className="absolute -right-2 top-1/2 flex -translate-y-1/2 flex-col gap-3" aria-label="Choose a console">
                {products.map((x, i) => (
                  <li key={x.id}>
                    <button
                      type="button"
                      onClick={() => goTo(i)}
                      aria-label={`Show ${x.name}`}
                      aria-current={i === active ? "true" : undefined}
                      className={`grid size-11 place-items-center rounded-full border font-display text-xs font-semibold tabular-nums transition-all duration-300 ${i === active ? "scale-110 border-transparent bg-gradient-to-b from-fill to-fill-2 text-accent-ink" : "glass text-muted hover:text-ink"}`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
