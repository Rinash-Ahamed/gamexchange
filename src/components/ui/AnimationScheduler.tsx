"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Keep the same visible effects, but do not repaint off-screen gradient text. */
export function AnimationScheduler() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname.startsWith("/admin") || !("IntersectionObserver" in window)) return;
    const selector = ".text-gradient, .text-gradient-motion, .footer-logo-heartbeat";
    const watched = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) entry.target.setAttribute("data-motion-visible", String(entry.isIntersecting));
    }, { rootMargin: "100px" });
    const observe = (element: Element) => {
      if (watched.has(element)) return;
      watched.add(element);
      observer.observe(element);
    };
    const scan = (root: Element) => {
      if (root.matches(selector)) observe(root);
      root.querySelectorAll(selector).forEach(observe);
    };
    scan(document.body);
    // Streamed sections and rotating headlines can arrive after the first scan.
    const mutations = new MutationObserver((records) => {
      for (const record of records) for (const node of record.addedNodes) if (node instanceof Element) scan(node);
      for (const element of watched) if (!element.isConnected) { observer.unobserve(element); watched.delete(element); }
    });
    mutations.observe(document.body, { childList: true, subtree: true });
    const syncVisibility = () => document.documentElement.setAttribute("data-effects-paused", String(document.hidden));
    syncVisibility();
    document.addEventListener("visibilitychange", syncVisibility);
    return () => {
      observer.disconnect();
      mutations.disconnect();
      document.removeEventListener("visibilitychange", syncVisibility);
      document.documentElement.removeAttribute("data-effects-paused");
      watched.forEach((element) => element.removeAttribute("data-motion-visible"));
    };
  }, [pathname]);
  return null;
}
