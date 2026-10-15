"use client";

import { useId, useMemo, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { ProductCard } from "./ProductCard";
import { Glyph, glyphTint, type GlyphName } from "@/components/ui/Glyph";
import type { Product } from "@/data/products";
import { ControllerButton } from "@/components/ui/ControllerButton";
import { whatsappUrl } from "@/data/site";

type Platform = string;

const sorts = {
  featured: "Featured",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  name: "Name A–Z",
} as const;
type SortKey = keyof typeof sorts;

const platformGlyphs: readonly GlyphName[] = ["o", "tri", "sq"];

const sorters: Record<SortKey, (a: Product, b: Product) => number> = {
  featured: (a, b) => Number(b.featured ?? false) - Number(a.featured ?? false),
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
  name: (a, b) => a.name.localeCompare(b.name),
};

export function ProductBrowser({ products }: { products: readonly Product[] }) {
  const [platform, setPlatform] = useState<Platform>("All");
  const [sort, setSort] = useState<SortKey>("featured");
  const sortId = useId();
  const platforms = useMemo(() => ["All", ...new Set(products.map((product) => product.platform))], [products]);

  const visible = useMemo(
    () => products.filter((p) => platform === "All" || p.platform === platform).toSorted(sorters[sort]),
    [platform, products, sort],
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div role="radiogroup" aria-label="Filter by platform" className="flex flex-wrap gap-2">
          {platforms.map((p, platformIndex) => {
            const selected = p === platform;
            const glyph = p === "All" ? "x" : (platformGlyphs[(platformIndex - 1) % platformGlyphs.length] ?? "sq");
            return (
              <button
                key={p}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setPlatform(p)}
                className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 font-display text-xs font-semibold uppercase tracking-[0.16em] transition-all duration-200 touch-manipulation active:scale-95 ${selected ? "border-transparent bg-gradient-to-b from-fill to-fill-2 text-accent-ink" : "glass text-muted hover:text-ink"}`}
              >
                <span style={{ color: selected ? undefined : glyphTint[glyph] }}><Glyph name={glyph} className="size-3.5" /></span>
                {p}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <label htmlFor={sortId} className="text-sm text-muted">Sort</label>
          <select
            id={sortId}
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="min-h-11 rounded-full border border-line-strong bg-surface px-4 text-sm text-ink"
          >
            {Object.entries(sorts).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
          </select>
        </div>
      </div>

      <p role="status" className="mt-5 text-sm text-muted">
        Showing {visible.length} {visible.length === 1 ? "product" : "products"}
      </p>

      <m.ul layout className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visible.map((p, i) => (
            <m.li key={p.id} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.3 }}>
              <ProductCard product={p} index={i} total={visible.length} priority={i === 0} />
            </m.li>
          ))}
        </AnimatePresence>
      </m.ul>

      {!visible.length && <p className="mt-6 rounded-2xl border border-dashed border-line-strong p-10 text-center text-muted">No products are currently available.</p>}

      <div className="metal mt-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl p-6">
        <div>
          <h2 className="font-display text-2xl font-bold uppercase">Looking for games, controllers or accessories?</h2>
          <p className="mt-1 max-w-xl text-muted">Stock changes often. Ask the shop and we’ll tell you what’s on the shelf today.</p>
        </div>
        <ControllerButton href={whatsappUrl("Hi GamexChange, what games, controllers and accessories do you have in stock?")} external glyph="tri">Ask on WhatsApp</ControllerButton>
      </div>
    </div>
  );
}
