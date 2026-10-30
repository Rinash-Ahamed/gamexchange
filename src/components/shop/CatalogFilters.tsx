import { useId } from "react";
import { catalogSorts, type CatalogFacet, type CatalogFilters as Filters } from "@/lib/catalog";

export function CatalogFilters({ filters, groups, priceCeiling, update, clear }: { filters: Filters; groups: CatalogFacet[]; priceCeiling: number; update: (next: Partial<Filters>) => void; clear: () => void }) {
  const id = useId();
  const ceiling = Math.max(1, priceCeiling, Number(filters.min) || 0, Number(filters.max) || 0);
  const inputClass = "min-h-11 w-full min-w-0 rounded-lg border border-line-strong bg-surface px-3 text-base text-ink sm:text-sm";
  return <div className="overflow-hidden rounded-2xl border border-line-strong bg-surface">
    <div className="flex items-center justify-between border-b border-line p-4"><h2 className="font-display text-lg font-bold">Refine your gear</h2><button type="button" onClick={clear} className="min-h-11 px-1 text-xs font-semibold text-accent-text hover:underline">Reset</button></div>
    <div className="space-y-5 p-4">
      <label className="block"><span className="mb-2 block text-sm font-semibold">Sort results</span><select value={filters.sort} onChange={(event) => update({ sort: event.target.value as Filters["sort"] })} className={inputClass}>{Object.entries(catalogSorts).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
      <fieldset className="border-t border-line pt-4"><legend className="pr-2 text-sm font-semibold">Price range</legend><div className="grid grid-cols-2 gap-2">
        <label><span className="mb-1 block text-xs text-muted">Minimum (₹)</span><input type="number" min="0" max="10000000" value={filters.min} onChange={(event) => update({ min: event.target.value })} placeholder="0" className={inputClass} /></label>
        <label><span className="mb-1 block text-xs text-muted">Maximum (₹)</span><input type="number" min="0" max="10000000" value={filters.max} onChange={(event) => update({ max: event.target.value })} placeholder="Any" className={inputClass} /></label>
      </div>{filters.min !== "" && filters.max !== "" && Number(filters.min) > Number(filters.max) && <p role="alert" className="mt-2 text-xs text-danger">Maximum must be at least the minimum.</p>}
        <div className="mt-3 space-y-2"><label className="block text-xs text-muted">Adjust minimum<input type="range" aria-label="Minimum price slider" min="0" max={ceiling} step="1" value={Math.min(ceiling, Math.max(0, Number(filters.min) || 0))} onChange={(event) => { const min = Number(event.target.value); update({ min: String(min), ...(filters.max !== "" && min > Number(filters.max) ? { max: String(min) } : {}) }); }} className="mt-1 min-h-8 w-full accent-[var(--fill)]" /></label><label className="block text-xs text-muted">Adjust maximum<input type="range" aria-label="Maximum price slider" min="0" max={ceiling} step="1" value={filters.max === "" ? ceiling : Math.min(ceiling, Math.max(0, Number(filters.max) || 0))} onChange={(event) => { const max = Number(event.target.value); update({ max: String(max), ...(filters.min !== "" && max < Number(filters.min) ? { min: String(max) } : {}) }); }} className="mt-1 min-h-8 w-full accent-[var(--fill)]" /></label></div>
      </fieldset>
      {groups.map((group) => <details key={group.key} open={["platforms", "conditions", "categories"].includes(group.key)} className="group border-t border-line pt-2"><summary className="flex min-h-11 cursor-pointer items-center justify-between gap-2 text-sm font-semibold"><span>{group.title}</span><span aria-hidden className="text-muted group-open:rotate-180">⌄</span></summary><div className="space-y-1">
        {group.options.length ? group.options.map(({ value, count }, index) => {
          const selected = filters[group.key].includes(value);
          return <label key={value} htmlFor={`${id}-${group.key}-${index}`} className={`flex min-h-11 items-center gap-2.5 text-sm ${count || selected ? "cursor-pointer text-muted" : "cursor-not-allowed text-muted/60"}`}><input id={`${id}-${group.key}-${index}`} type="checkbox" disabled={!count && !selected} checked={selected} onChange={(event) => update({ [group.key]: event.target.checked ? [...filters[group.key], value] : filters[group.key].filter((entry) => entry !== value) })} className="size-4 shrink-0 accent-[var(--fill)]" /><span className="min-w-0 flex-1 break-words">{value}</span><span className="text-xs tabular-nums" aria-label={`${count} matching products`}>{count}</span></label>;
        }) : <p className="pb-3 text-xs leading-5 text-muted">{group.emptyMessage}</p>}
      </div></details>)}
      <label className="flex min-h-11 cursor-pointer items-center gap-2.5 border-t border-line pt-4 text-sm"><input type="checkbox" checked={filters.sale} onChange={(event) => update({ sale: event.target.checked })} className="size-4 accent-[var(--fill)]" />Discounted items only</label>
      <p className="text-xs leading-5 text-muted">Counts reflect your other filters. Zero-count choices are unavailable. Only active, in-stock products are listed.</p>
    </div>
  </div>;
}
