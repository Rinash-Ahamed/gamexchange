"use client";

import { useEffect, useRef, type ElementType, type ReactNode, type PointerEvent } from "react";
import { useMedia } from "@/lib/use-media";

/** Surface with a soft pointer-following light. One handler and CSS variables only; no re-renders. */
export function LightCard({ children, className = "", as: Tag = "div" }: { children: ReactNode; className?: string; as?: ElementType }) {
  const interactive = useMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
  const light = useRef<HTMLSpanElement>(null);
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
      // Keep invalidation on the decorative layer, not inherited by every card child.
      light.current?.style.setProperty("--mx", `${point.x - rect.left}px`);
      light.current?.style.setProperty("--my", `${point.y - rect.top}px`);
    });
  };
  const onLeave = () => {
    if (frame.current !== undefined) cancelAnimationFrame(frame.current);
    frame.current = undefined;
    pointer.current = undefined;
  };
  return (
    <Tag onPointerMove={interactive ? onMove : undefined} onPointerLeave={onLeave} className={`cursor-light-host group relative overflow-hidden ${className}`}>
      <span ref={light} aria-hidden className="cursor-light pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative h-full">{children}</div>
    </Tag>
  );
}
