"use client";

import { useEffect } from "react";

/**
 * Context-reactive illumination. Sections declare data-tone="blue|violet|teal"; whichever
 * crosses the middle of the viewport sets <html data-tone>, and CSS cross-fades three fixed
 * light layers (opacity only). State changes only when the section changes, never per frame.
 */
export function AmbientLight() {
  useEffect(() => {
    const root = document.documentElement;
    const targets = document.querySelectorAll<HTMLElement>("[data-tone]");
    if (!targets.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) root.dataset.tone = (e.target as HTMLElement).dataset.tone;
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    targets.forEach((t) => io.observe(t));
    return () => {
      io.disconnect();
      delete root.dataset.tone;
    };
  }, []);

  return (
    <div aria-hidden className="amb">
      <div className="amb-layer amb-blue" />
      <div className="amb-layer amb-violet" />
      <div className="amb-layer amb-teal" />
    </div>
  );
}
