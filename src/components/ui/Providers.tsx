"use client";

import type Lenis from "lenis";
import { usePathname } from "next/navigation";
import { LazyMotion, MotionConfig } from "motion/react";
import { useEffect, type ReactNode } from "react";
import { AnimationScheduler } from "./AnimationScheduler";
import { NavigationPrefetch } from "./NavigationPrefetch";

const loadFeatures = () => import("./motion-features").then((m) => m.default);

export function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const pointerQuery = window.matchMedia("(pointer: fine)");
    let lenis: Lenis | undefined;
    let revision = 0;
    let disposed = false;

    const syncScroll = async () => {
      const current = ++revision;
      lenis?.destroy();
      lenis = undefined;

      if (!motionQuery.matches || !pointerQuery.matches) return;

      let constructor: typeof import("lenis");
      try { constructor = await import("lenis"); }
      catch { return; } // Native scrolling remains available if the optional chunk fails.
      const { default: Lenis } = constructor;
      if (disposed || current !== revision) return;
      lenis = new Lenis({
        anchors: { offset: -96 },
        autoRaf: true,
        duration: 0.22,
        smoothWheel: true,
        stopInertiaOnNavigate: true,
        wheelMultiplier: 1,
        prevent: (node) => Boolean(node.closest("[data-native-scroll]")),
      });
    };

    void syncScroll();
    motionQuery.addEventListener("change", syncScroll);
    pointerQuery.addEventListener("change", syncScroll);

    return () => {
      disposed = true;
      motionQuery.removeEventListener("change", syncScroll);
      pointerQuery.removeEventListener("change", syncScroll);
      lenis?.destroy();
    };
  }, [pathname]);

  return (
    <LazyMotion features={loadFeatures} strict>
      <AnimationScheduler />
      <NavigationPrefetch />
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
