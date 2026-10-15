"use client";

import type { ElementType, ReactNode, PointerEvent } from "react";

/** Surface with a soft pointer-following light. One handler, CSS variables only — no re-renders. */
export function LightCard({ children, className = "", as: Tag = "div" }: { children: ReactNode; className?: string; as?: ElementType }) {
  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <Tag onPointerMove={onMove} className={`cursor-light-host group relative overflow-hidden ${className}`}>
      <span aria-hidden className="cursor-light pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative">{children}</div>
    </Tag>
  );
}
