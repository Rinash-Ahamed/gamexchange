"use client";

import { useId, useState } from "react";
import { Plus } from "lucide-react";

type Item = { q: string; a: string };

export function Accordion({ items }: { items: readonly Item[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const uid = useId();

  return (
    <div className="divide-y divide-line overflow-hidden rounded-3xl metal">
      {items.map((item, i) => {
        const isOpen = open === i;
        const panel = `${uid}-p${i}`;
        const btn = `${uid}-b${i}`;
        return (
          <div key={item.q}>
            <h3>
              <button
                id={btn}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panel}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex min-h-16 w-full items-center justify-between gap-4 px-5 py-4 text-left font-display text-base font-semibold tracking-wide sm:px-7 sm:text-lg"
              >
                {item.q}
                <span className={`grid size-8 shrink-0 place-items-center rounded-full border border-line-strong transition-transform duration-300 ${isOpen ? "rotate-45 bg-fill text-accent-ink" : ""}`}>
                  <Plus className="size-4" aria-hidden />
                </span>
              </button>
            </h3>
            <div id={panel} role="region" aria-labelledby={btn} className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
              <div className="overflow-hidden">
                <p className="whitespace-pre-line px-5 pb-6 leading-relaxed text-muted sm:px-7">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
