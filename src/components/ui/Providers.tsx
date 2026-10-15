"use client";

import Lenis from "lenis";
import { LazyMotion, MotionConfig } from "motion/react";
import { useEffect, type ReactNode } from "react";

const loadFeatures = () => import("./motion-features").then((m) => m.default);

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const pointerQuery = window.matchMedia("(pointer: fine)");
    let lenis: Lenis | undefined;

    const syncScroll = () => {
      lenis?.destroy();
      lenis = undefined;

      if (!motionQuery.matches || !pointerQuery.matches) return;

      lenis = new Lenis({
        anchors: { offset: -96 },
        autoRaf: true,
        duration: 0.9,
        smoothWheel: true,
        stopInertiaOnNavigate: true,
        wheelMultiplier: 0.9,
        prevent: (node) => Boolean(node.closest("[data-native-scroll]")),
      });
    };

    syncScroll();
    motionQuery.addEventListener("change", syncScroll);
    pointerQuery.addEventListener("change", syncScroll);

    return () => {
      motionQuery.removeEventListener("change", syncScroll);
      pointerQuery.removeEventListener("change", syncScroll);
      lenis?.destroy();
    };
  }, []);

  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
