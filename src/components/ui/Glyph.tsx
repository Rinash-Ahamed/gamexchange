export type GlyphName = "x" | "o" | "tri" | "sq" | "play";

export const glyphTint: Record<GlyphName, string> = {
  x: "var(--accent)",
  o: "var(--accent-2)",
  tri: "var(--ok)",
  sq: "var(--muted)",
  play: "var(--accent)",
};

export function Glyph({ name, className = "size-4" }: { name: GlyphName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      {name === "x" && <path d="M6 6l12 12M18 6L6 18" />}
      {name === "o" && <circle cx="12" cy="12" r="7" />}
      {name === "tri" && <path d="M12 4.5l8 14H4z" />}
      {name === "sq" && <rect x="5.5" y="5.5" width="13" height="13" rx="1.5" />}
      {name === "play" && <path d="M8 5l11 7-11 7z" fill="currentColor" strokeWidth={1.5} />}
    </svg>
  );
}
