"use client";

import { useRef, type ReactNode } from "react";
import { useInView } from "motion/react";
import { usePageVisible } from "@/lib/use-page-visible";

export function AnimationBoundary({ children, className, label }: { children: ReactNode; className?: string; label?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "100px" });
  const pageVisible = usePageVisible();
  return <div ref={ref} data-live={inView && pageVisible ? "true" : "false"} className={className} aria-label={label}>{children}</div>;
}
