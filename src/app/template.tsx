"use client";

import { m } from "motion/react";
import type { ReactNode } from "react";

/** Page transition: re-mounts on navigation. Opacity + transform only. */
export default function Template({ children }: { children: ReactNode }) {
  return (
    <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </m.div>
  );
}
