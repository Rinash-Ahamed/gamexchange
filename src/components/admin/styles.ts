export const adminInputClass =
  "admin-control w-full rounded-lg border border-line-strong bg-surface px-3 text-base text-ink placeholder:text-muted/70 transition-[border-color,box-shadow] duration-200 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/20 sm:text-sm";

export const adminFileInputClass =
  `${adminInputClass} min-w-0 py-1 file:mr-3 file:min-h-9 file:cursor-pointer file:rounded-lg file:border-0 file:bg-gradient-to-b file:from-fill file:to-fill-2 file:px-3 file:py-2 file:font-display file:text-xs file:font-semibold file:uppercase file:tracking-[0.08em] file:text-accent-ink file:transition-[filter] file:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50`;

export const adminLabelClass = "mb-1 block text-[11px] font-semibold uppercase tracking-[0.08em] text-muted";

export const adminButtonClass =
  "admin-control inline-flex items-center justify-center rounded-lg bg-gradient-to-b from-fill to-fill-2 px-3 font-display text-xs font-semibold uppercase tracking-[0.08em] text-accent-ink transition-[filter,transform] hover:brightness-110 active:scale-[0.98]";

export const adminGhostButtonClass =
  "admin-control inline-flex items-center justify-center rounded-lg border border-line-strong bg-surface px-3 font-display text-xs font-semibold uppercase tracking-[0.08em] text-ink transition-colors hover:border-blue hover:text-accent-text active:scale-[0.98]";

export function adminNavLinkClass(active: boolean) {
  return `admin-control flex items-center gap-2.5 rounded-lg px-3 font-display text-xs font-semibold uppercase tracking-[0.08em] transition-colors ${active ? "bg-gradient-to-r from-fill to-fill-2 text-accent-ink" : "text-muted hover:bg-surface-2 hover:text-ink"}`;
}
