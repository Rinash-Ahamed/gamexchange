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
    const visibility = new Map<Element, boolean>();
    const paused = new Map<Animation, number>();
    const sync = (element: Element) => {
      const shouldPause = document.hidden || visibility.get(element) === false;
      // Control browser animations, not React-owned attributes or inline styles.
      // A zero playback rate preserves CSS play-state gates and reduced motion.
      for (const animation of element.getAnimations()) {
        if (shouldPause) {
          if (!paused.has(animation)) paused.set(animation, animation.playbackRate);
          animation.playbackRate = 0;
        } else if (paused.has(animation)) {
          animation.playbackRate = paused.get(animation)!;
          paused.delete(animation);
        }
      }
    };
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        visibility.set(entry.target, entry.isIntersecting);
        sync(entry.target);
      }
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
      for (const element of watched) if (!element.isConnected) { observer.unobserve(element); watched.delete(element); visibility.delete(element); }
      for (const animation of paused.keys()) if (!(animation.effect instanceof KeyframeEffect) || !animation.effect.target?.isConnected) paused.delete(animation);
    });
    mutations.observe(document.body, { childList: true, subtree: true });
    const syncVisibility = () => watched.forEach(sync);
    syncVisibility();
    document.addEventListener("visibilitychange", syncVisibility);
    return () => {
      observer.disconnect();
      mutations.disconnect();
      document.removeEventListener("visibilitychange", syncVisibility);
      paused.forEach((rate, animation) => { animation.playbackRate = rate; });
      paused.clear();
      visibility.clear();
    };
  }, [pathname]);
  return null;
}
