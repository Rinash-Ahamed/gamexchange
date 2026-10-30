import { ChevronLeft, ChevronRight } from "lucide-react";
import { paginationLinks } from "@/lib/pagination";

export function CatalogPagination({ page, pageCount, onPageChange }: { page: number; pageCount: number; onPageChange: (page: number) => void }) {
  if (pageCount < 2) return null;
  const button = "inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border px-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40";
  return <nav aria-label="Shop pagination" className="mt-7 border-t border-line pt-5">
    <p className="mb-3 text-center text-xs text-muted">Page {page} of {pageCount}</p>
    <div className="mx-auto grid max-w-xl grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-2">
      <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="Previous page" className={`${button} border-line-strong bg-surface text-ink hover:border-blue`}><ChevronLeft className="size-4" aria-hidden /><span className="hidden sm:inline">Previous</span></button>
      <div className="flex min-w-0 flex-wrap justify-center gap-1">
        {paginationLinks(page, pageCount).map((entry) => typeof entry === "number" ? <button key={entry} type="button" aria-label={`Page ${entry}`} aria-current={entry === page ? "page" : undefined} onClick={() => onPageChange(entry)} className={`${button} ${entry === page ? "border-transparent bg-gradient-to-br from-fill to-fill-2 text-accent-ink" : "border-line-strong bg-surface text-ink hover:border-blue"}`}>{entry}</button> : <span key={entry} aria-hidden className="grid min-h-11 w-5 place-items-center text-muted">…</span>)}
      </div>
      <button type="button" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)} aria-label="Next page" className={`${button} border-line-strong bg-surface text-ink hover:border-blue`}><span className="hidden sm:inline">Next</span><ChevronRight className="size-4" aria-hidden /></button>
    </div>
  </nav>;
}
