"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

/** Prepare public destinations on intent, not every product merely passing the viewport. */
export function NavigationPrefetch() {
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    const warmed = new Map<string, number>();
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    let timer: number | undefined;
    const warm = (target: EventTarget | null) => {
      if (document.hidden || connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType ?? "")) return;
      const anchor = target instanceof Element ? target.closest("a[href]") : null;
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href);
      if (url.origin !== location.origin || !/^\/(?:products(?:\/[^/]+)?|cart|exchange|repair-service|game-zone|contact|franchise|terms|policies(?:\/[^/]+)?)?$/.test(url.pathname)) return;
      if (url.pathname === pathname && !url.search) return;
      const href = url.pathname + url.search;
      if ((warmed.get(href) ?? 0) > Date.now()) return;
      warmed.set(href, Date.now() + 30000);
      if (warmed.size > 64) warmed.delete(warmed.keys().next().value!);
      // Use the public one-argument API. This Next version requires an internal
      // PrefetchKind enum whenever an options object is supplied.
      // The bounded warm-up map expires independently after 30 seconds.
      router.prefetch(href);
    };
    const hover = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!anchor || (event.relatedTarget instanceof Node && anchor.contains(event.relatedTarget))) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => warm(anchor), 80);
    };
    const focus = (event: FocusEvent) => warm(event.target);
    const touch = (event: PointerEvent) => { if (event.pointerType === "touch") warm(event.target); };
    const cancel = () => window.clearTimeout(timer);
    const leave = (event: PointerEvent) => {
      const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (anchor && event.relatedTarget instanceof Node && anchor.contains(event.relatedTarget)) return;
      cancel();
    };
    document.addEventListener("pointerover", hover, { passive: true });
    document.addEventListener("pointerout", leave, { passive: true });
    document.addEventListener("focusin", focus);
    document.addEventListener("pointerdown", touch, { passive: true });
    return () => {
      cancel();
      document.removeEventListener("pointerover", hover);
      document.removeEventListener("pointerout", leave);
      document.removeEventListener("focusin", focus);
      document.removeEventListener("pointerdown", touch);
    };
  }, [pathname, router]);
  return null;
}
