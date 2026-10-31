"use client";

import { useEffect, useRef, type ElementType, type ReactNode, type PointerEvent } from "react";

/** Surface with a soft pointer-following light. One handler and CSS variables only; no re-renders. */
export function LightCard({ children, className = "", as: Tag = "div" }: { children: ReactNode; className?: string; as?: ElementType }) {
  const frame = useRef<number | undefined>(undefined);
  const pointer = useRef<{ element: HTMLElement; x: number; y: number } | undefined>(undefined);
  useEffect(() => () => { if (frame.current !== undefined) cancelAnimationFrame(frame.current); }, []);
  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    pointer.current = { element: e.currentTarget, x: e.clientX, y: e.clientY };
    if (frame.current !== undefined) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = undefined;
      const point = pointer.current;
      if (!point?.element.isConnected) return;
      const rect = point.element.getBoundingClientRect();
      point.element.style.setProperty("--mx", `${point.x - rect.left}px`);
      point.element.style.setProperty("--my", `${point.y - rect.top}px`);
    });
  };
  return (
    <Tag onPointerMove={onMove} className={`cursor-light-host group relative overflow-hidden ${className}`}>
      <span aria-hidden className="cursor-light pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative h-full">{children}</div>
    </Tag>
  );
}
