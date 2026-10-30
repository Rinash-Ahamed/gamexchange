"use client";

import { useId, useMemo, useRef, useState } from "react";
import { Gamepad2, Headphones, Layers, Search, SlidersHorizontal, X } from "lucide-react";
import { productSection, shopSections } from "@/data/catalog";
import type { Product } from "@/data/products";
import { whatsappUrl } from "@/data/site";
import { availableCatalog, catalogFacetKeys, consumerCatalogFacets, emptyCatalogFilters, filterCatalog, type CatalogFilters as Filters } from "@/lib/catalog";
import { paginate } from "@/lib/pagination";
import { CatalogCard } from "./CatalogCard";
import { CatalogFilters } from "./CatalogFilters";
import { CatalogPagination } from "./CatalogPagination";

const icons = { games: Gamepad2, consoles: Layers, accessories: Headphones };

export function ProductBrowser({ products, initialFilters = {} }: { products: readonly Product[]; initialFilters?: Partial<Filters> }) {
  const [filters, setFilters] = useState<Filters>({ ...emptyCatalogFilters, ...initialFilters });
  const [mobileFilters, setMobileFilters] = useState(false);
  const [page, setPage] = useState(1);
  const results = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const catalog = useMemo(() => availableCatalog(products), [products]);
  const scoped = useMemo(() => catalog.filter((product) => filters.section === "all" || productSection(product) === filters.section), [catalog, filters.section]);
  const visible = useMemo(() => filterCatalog(catalog, filters), [catalog, filters]);
  const groups = useMemo(() => consumerCatalogFacets(catalog, filters), [catalog, filters]);
  const pagination = paginate(visible, page);
  const platforms = groups.find((group) => group.key === "platforms")?.options ?? [];
  const priceCeiling = scoped.reduce((maximum, product) => Math.max(maximum, product.price), 1);
  const update = (next: Partial<Filters>) => { setFilters((current) => ({ ...current, ...next })); setPage(1); };
  const clear = () => { setFilters({ ...emptyCatalogFilters }); setPage(1); };
  const goToPage = (next: number) => {
    if (next === pagination.page || next < 1 || next > pagination.pageCount) return;
    setPage(next);
    requestAnimationFrame(() => {
      results.current?.focus({ preventScroll: true });
      results.current?.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    });
  };
  const chips = catalogFacetKeys.flatMap((key) => filters[key].map((value) => ({ key, value })));

  return <div className="pb-12">
    <nav aria-label="Shop departments" className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
      <button type="button" aria-pressed={filters.section === "all"} onClick={() => update({ ...emptyCatalogFilters })} className={`min-h-14 rounded-2xl border px-3 text-left font-display text-sm font-semibold transition-colors ${filters.section === "all" ? "border-transparent bg-gradient-to-br from-fill to-fill-2 text-accent-ink" : "border-line-strong bg-surface text-ink hover:border-blue"}`}>All gear<span className="ml-2 text-xs opacity-70">{catalog.length}</span></button>
      {shopSections.map((section) => {
        const Icon = icons[section.id];
        const count = catalog.filter((product) => productSection(product) === section.id).length;
        return <button key={section.id} type="button" aria-pressed={filters.section === section.id} onClick={() => update({ ...emptyCatalogFilters, section: section.id, q: filters.q, sort: filters.sort })} className={`flex min-h-14 items-center gap-2 rounded-2xl border px-3 text-left font-display text-sm font-semibold transition-colors ${filters.section === section.id ? "border-transparent bg-gradient-to-br from-fill to-fill-2 text-accent-ink" : "border-line-strong bg-surface text-ink hover:border-blue"}`}><Icon className="size-4 shrink-0" aria-hidden /><span>{section.label}</span><span className="ml-auto text-xs opacity-70">{count}</span></button>;
      })}
    </nav>

    <div className="mt-5 flex flex-wrap items-center gap-3">
      <label className="relative block min-w-0 flex-1 basis-72"><span className="sr-only">Search the shop</span><Search className="pointer-events-none absolute left-3 top-3 size-5 text-muted" aria-hidden /><input type="search" value={filters.q} onChange={(event) => update({ q: event.target.value })} maxLength={160} placeholder="Search games, consoles and accessories" className="min-h-11 w-full rounded-xl border border-line-strong bg-surface pl-11 pr-3 text-base text-ink sm:text-sm" /></label>
      <a href="/exchange" className="inline-flex min-h-11 items-center rounded-xl border border-line-strong px-4 font-display text-xs font-semibold text-accent-text hover:border-blue">Sell or exchange your gear</a>
    </div>

    <div role="group" aria-label="Filter by platform" className="mt-4 flex flex-wrap gap-2">
      <button type="button" aria-pressed={!filters.platforms.length} onClick={() => update({ platforms: [] })} className={`min-h-11 rounded-full border px-4 text-xs font-semibold ${!filters.platforms.length ? "border-blue bg-fill/10 text-accent-text" : "border-line bg-surface text-muted"}`}>All</button>
      {platforms.map(({ value: platform, count }) => {
        const checked = filters.platforms.includes(platform);
        return <button key={platform} type="button" aria-pressed={checked} disabled={!count && !checked} onClick={() => update({ platforms: checked ? filters.platforms.filter((value) => value !== platform) : [...filters.platforms, platform] })} className={`min-h-11 rounded-full border px-4 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${checked ? "border-blue bg-fill/10 text-accent-text" : "border-line bg-surface text-muted hover:border-blue hover:text-ink"}`}>{platform}<span aria-hidden className="ml-1.5 opacity-65">{count}</span></button>;
      })}
    </div>

    <div className="mt-6 grid items-start gap-5 lg:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="min-w-0 lg:sticky lg:top-24">
        <button type="button" aria-expanded={mobileFilters} aria-controls={panelId} onClick={() => setMobileFilters((open) => !open)} className="mb-3 inline-flex min-h-11 items-center gap-2 rounded-xl border border-line-strong bg-surface px-4 text-sm font-semibold lg:hidden"><SlidersHorizontal className="size-4" aria-hidden />{mobileFilters ? "Hide filters" : "Filters and sorting"}</button>
        <div id={panelId} data-native-scroll className={`${mobileFilters ? "block" : "hidden lg:block"} lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto`}><CatalogFilters filters={filters} groups={groups} priceCeiling={priceCeiling} update={update} clear={clear} /></div>
      </aside>
      <div ref={results} role="region" aria-label="Shop results" tabIndex={-1} className="min-w-0 scroll-mt-28">
        <div className="flex flex-wrap items-center justify-between gap-2"><p role="status" className="text-sm text-muted">{pagination.total ? `Showing ${pagination.from} to ${pagination.to} of ${pagination.total} ${pagination.total === 1 ? "product" : "products"}` : "Showing 0 products"}</p><span className="text-xs text-muted">Available stock only</span></div>
        {(chips.length > 0 || filters.q || filters.min || filters.max || filters.sale || filters.minDiscount > 0) && <div className="mt-3 flex flex-wrap items-center gap-2">
          {chips.map(({ key, value }) => <button key={`${key}-${value}`} type="button" aria-label={`Remove ${value} filter`} onClick={() => update({ [key]: filters[key].filter((entry) => entry !== value) })} className="inline-flex min-h-9 items-center gap-2 rounded-full border border-blue/30 bg-fill/10 px-3 text-xs text-accent-text">{value}<X className="size-3" aria-hidden /></button>)}
          {filters.minDiscount > 0 && <button type="button" onClick={() => update({ minDiscount: 0 })} className="inline-flex min-h-9 items-center gap-2 rounded-full border border-blue/30 px-3 text-xs text-accent-text">{filters.minDiscount}% or more<X className="size-3" aria-hidden /></button>}
          <button type="button" onClick={clear} className="min-h-9 px-2 text-xs text-accent-text hover:underline">Clear all filters</button>
        </div>}
        <ul className="mt-4 grid grid-cols-2 gap-3 min-[600px]:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {pagination.items.map((product, index) => <li key={product.id} className="min-w-0"><CatalogCard product={product} priority={index === 0} eager={index < 4} /></li>)}
        </ul>
        {!visible.length && <div className="rounded-2xl border border-dashed border-line-strong p-6 text-center sm:p-10"><h2 className="font-display text-xl font-semibold">No matching gear right now</h2><p className="mt-2 text-sm leading-relaxed text-muted">Try another search or clear your filters. We only list stock we actually have.</p><button type="button" onClick={clear} className="mt-4 min-h-11 rounded-xl bg-fill px-4 text-sm font-semibold text-accent-ink">Reset filters</button><a href={whatsappUrl("Hi GamexChange, can you help me find a game, console or accessory?")} target="_blank" rel="noopener noreferrer" className="mx-3 mt-4 inline-flex min-h-11 items-center text-sm text-accent-text underline">Ask the team</a></div>}
        <CatalogPagination page={pagination.page} pageCount={pagination.pageCount} onPageChange={goToPage} />
      </div>
    </div>
  </div>;
}
