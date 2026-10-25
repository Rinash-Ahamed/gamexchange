"use client";

import { useState } from "react";
import { repairFaults } from "@/data/repair";

type Node = "power" | "video" | "input" | "board" | "thermal" | "disc";

const nodes: { id: Node; label: string; angle: number }[] = [
  { id: "power", label: "POWER", angle: -150 },
  { id: "video", label: "VIDEO OUT", angle: -90 },
  { id: "input", label: "INPUTS", angle: -30 },
  { id: "board", label: "MAINBOARD", angle: 30 },
  { id: "thermal", label: "THERMAL", angle: 90 },
  { id: "disc", label: "DISC / LENS", angle: 150 },
];

/** Which area of the diagnostic map each listed fault relates to. */
const faultToNodes: Record<string, Node[]> = {
  "Power issues": ["power"],
  "Power supply": ["power"],
  "HDMI port": ["video"],
  "Analogue drift issues": ["input"],
  "Button issues": ["input"],
  "Motherboard issues": ["board"],
  "Heating issues": ["thermal"],
  "Lens reading issues": ["disc"],
  "General service": ["power", "video", "input", "board", "thermal", "disc"],
  Others: [],
};

const R = 128;
const pos = (deg: number) => ({ x: 200 + R * Math.cos((deg * Math.PI) / 180), y: 200 + R * Math.sin((deg * Math.PI) / 180) });

/** Abstract diagnostic-scan visual. Deliberately generic: it is not a model of any specific device. */
export function RepairDiagnostic({ value, values, onChange }: { value?: string | null; values?: readonly string[]; onChange?: (fault: string) => void }) {
  const [internal, setInternal] = useState<string>("Power issues");
  const active = value !== undefined ? value : internal;
  const selected = values ?? (active ? [active] : []);
  const lit = new Set(selected.flatMap((fault) => faultToNodes[fault] ?? []));

  const select = (f: string) => {
    setInternal(f);
    onChange?.(f);
  };

  return (
    <div className="metal rounded-3xl p-5 sm:p-8">
      <div className="relative mx-auto aspect-square w-full max-w-md">
        <svg viewBox="0 0 400 400" className="size-full" role="img" aria-label={`Diagnostic map. ${selected.length ? `Highlighting areas related to: ${selected.join(", ")}.` : "Choose an issue to highlight related areas."}`}>
          <defs>
            <clipPath id="scan-clip"><circle cx="200" cy="200" r="170" /></clipPath>
          </defs>
          <circle cx="200" cy="200" r="170" fill="none" stroke="var(--line-strong)" strokeDasharray="2 7" />
          <circle cx="200" cy="200" r="100" fill="none" stroke="var(--line)" />
          {nodes.map((n) => {
            const p = pos(n.angle);
            const on = lit.has(n.id);
            return (
              <g key={n.id}>
                <line x1="200" y1="200" x2={p.x} y2={p.y} stroke={on ? "var(--accent)" : "var(--line-strong)"} strokeWidth={on ? 2.5 : 1} style={{ transition: "stroke 0.3s, stroke-width 0.3s" }} />
                <circle cx={p.x} cy={p.y} r={on ? 20 : 14} fill={on ? "var(--accent)" : "var(--surface-2)"} stroke={on ? "var(--accent-ink)" : "var(--line-strong)"} style={{ transition: "all 0.3s" }} />
                {on && <circle cx={p.x} cy={p.y} r="20" fill="none" stroke="var(--accent)" className="origin-center animate-[pulse-ring_1.6s_ease-out_infinite]" style={{ transformBox: "fill-box" }} />}
                <text x={p.x} y={p.y + (p.y > 200 ? 38 : -28)} textAnchor="middle" fontSize="11" fontWeight="600" letterSpacing="1.5" fill={on ? "var(--ink)" : "var(--muted)"} style={{ fontFamily: "var(--font-display)" }}>{n.label}</text>
              </g>
            );
          })}
          <rect x="168" y="168" width="64" height="64" rx="12" fill="var(--surface)" stroke="var(--accent)" strokeWidth="1.5" />
          <path d="M184 184h32v32h-32z M192 176v8 M208 176v8 M192 216v8 M208 216v8 M176 192h8 M176 208h8 M216 192h8 M216 208h8" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
          <g clipPath="url(#scan-clip)">
            <rect x="30" y="0" width="340" height="3" fill="var(--accent)" opacity="0.7" className="animate-[scan_3.4s_ease-in-out_infinite]" style={{ transformBox: "fill-box" }} />
          </g>
        </svg>
      </div>

      <p className="mt-4 text-center font-display text-xs font-semibold uppercase tracking-[0.3em] text-accent-text">{values ? "Select all issues that apply" : "Select the issue"}</p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {repairFaults.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={selected.includes(f)}
            onClick={() => select(f)}
            className={`min-h-11 rounded-full border px-4 text-sm font-medium transition-all duration-200 touch-manipulation active:scale-95 ${selected.includes(f) ? "border-transparent bg-gradient-to-b from-fill to-fill-2 text-accent-ink" : "border-line-strong bg-surface hover:border-blue"}`}
          >
            {f}
          </button>
        ))}
      </div>
    </div>
  );
}
