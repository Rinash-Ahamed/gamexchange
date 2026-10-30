export function ConditionBadge({ condition }: { condition: string }) {
  const key = condition.trim().toLowerCase().replace(/[\s-]/g, "");
  const tone = key === "new" ? "border-fill bg-fill text-accent-ink" : key === "preowned" ? "border-fill-2 bg-fill-2 text-accent-ink" : key === "refurbished" ? "border-ok bg-surface text-ok" : "border-line-strong bg-surface text-ink";
  return <span className={`inline-flex max-w-full items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-display text-[10px] font-bold uppercase leading-4 tracking-wide ${tone}`}><span aria-hidden className="size-1.5 shrink-0 rounded-full bg-current" /><span className="break-words">{condition}</span></span>;
}
