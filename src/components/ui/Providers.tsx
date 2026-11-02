"use client";

import { LazyMotion, MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { AnimationScheduler } from "./AnimationScheduler";
import { NavigationPrefetch } from "./NavigationPrefetch";

const loadFeatures = () => import("./motion-features").then((m) => m.default);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <AnimationScheduler />
      <NavigationPrefetch />
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
