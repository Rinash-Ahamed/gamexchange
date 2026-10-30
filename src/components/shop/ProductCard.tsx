"use client";

import { m, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import Link from "next/link";
import { ControllerButton } from "@/components/ui/ControllerButton";
import { useFinePointer } from "@/lib/use-media";
import { formatINR, type Product } from "@/data/products";
import { whatsappUrl } from "@/data/site";
import { ProductStage } from "./ProductStage";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { ConditionBadge } from "./ConditionBadge";
import { DiscountBadge, ProductPrice } from "./ProductPrice";
import { productHref } from "@/lib/product-links";

export function ProductCard({ product, index, total, priority = false }: { product: Product; index: number; total: number; priority?: boolean }) {
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const tilt = fine && !reduce;

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotY = useSpring(useTransform(px, [-0.5, 0.5], [-6, 6]), { stiffness: 160, damping: 22 });
  const rotX = useSpring(useTransform(py, [-0.5, 0.5], [5, -5]), { stiffness: 160, damping: 22 });

  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  const onLeave = () => { px.set(0); py.set(0); };

  const message = `Hi GamexChange, I'm interested in the ${product.name} (${product.condition}, listed at ${formatINR(product.price)}). Is it available?`;

  return (
    <article
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      aria-labelledby={`${product.id}-name`}
      className="metal edge-light group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] transition-shadow duration-500 hover:[box-shadow:var(--shadow-card),0_30px_80px_-30px_var(--accent)]"
      style={{ ["--glow" as string]: product.platform === "PlayStation 3" ? "var(--accent)" : "var(--accent-2)" }}
    >
      <div className="relative aspect-[4/3.1] [perspective:900px]">
        <div className="absolute inset-x-5 top-5 z-10 flex items-start justify-between">
          <span className="font-display text-xs font-semibold tabular-nums tracking-[0.2em] text-muted">{String(index + 1).padStart(2, "0")}<span className="opacity-50"> / {String(total).padStart(2, "0")}</span></span>
          <ConditionBadge condition={product.condition} />
        </div>
        <m.div style={tilt ? { rotateX: rotX, rotateY: rotY } : undefined} className="size-full [transform-style:preserve-3d]">
          <Link href={productHref(product.id)} prefetch={false} aria-label={`View ${product.name} details`} className="block size-full"><ProductStage product={product} priority={priority} sizes="(min-width: 1024px) 28vw, (min-width: 640px) 45vw, 92vw" className="size-full" /></Link>
        </m.div>
        <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent group-hover:animate-[flare_1.1s_ease-out]" />
      </div>

      <div className="relative flex flex-1 flex-col gap-4 p-6 pt-3">
        <div>
          <p className="font-display text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-text">{product.platform}</p>
          <h3 id={`${product.id}-name`} className="mt-1 font-display text-xl font-bold uppercase leading-tight tracking-wide"><Link href={productHref(product.id)} prefetch={false} className="hover:text-accent-text">{product.name}</Link></h3>
        </div>

        <div className="flex flex-wrap items-start gap-3"><ProductPrice product={product} className="text-4xl tracking-tight" /><DiscountBadge product={product} /></div>

        <dl className="grid grid-cols-2 divide-x divide-line rounded-2xl border border-line text-sm">
          <div className="p-3">
            <dt className="text-xs text-muted">Trade-in · voucher</dt>
            <dd className="font-display text-lg font-semibold tabular-nums">{formatINR(product.tradeInVoucher)}</dd>
          </div>
          <div className="p-3">
            <dt className="text-xs text-muted">Trade-in · cash</dt>
            <dd className="font-display text-lg font-semibold tabular-nums">{formatINR(product.tradeInCash)}</dd>
          </div>
        </dl>
        <p className="-mt-2 text-xs leading-relaxed text-muted">As listed on our current site. Confirm availability on WhatsApp; trade-in value is confirmed after the shop checks your device.</p>

        <div className="mt-auto flex flex-wrap gap-3 pt-1">
          <AddToCartButton product={product} />
          <ControllerButton href={whatsappUrl(message)} external glyph="x" size="sm">Enquire</ControllerButton>
          <ControllerButton href="/exchange" glyph="sq" size="sm" variant="ghost">Trade in</ControllerButton>
        </div>
      </div>
    </article>
  );
}
