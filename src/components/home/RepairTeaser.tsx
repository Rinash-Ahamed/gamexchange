"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ControllerButton } from "@/components/ui/ControllerButton";
import { RepairDiagnostic } from "@/components/zone/RepairDiagnostic";
import { repairFaults } from "@/data/repair";
import { site } from "@/data/site";
import { usePageVisible } from "@/lib/use-page-visible";

const tour = ["Power issues", "HDMI port", "Analogue drift issues", "Heating issues", "Lens reading issues", "Motherboard issues"].filter((f) => (repairFaults as readonly string[]).includes(f));

/** The diagnostic scans through common faults while in view; any interaction hands control to the visitor. */
export function RepairTeaser() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { margin: "-20% 0px" });
  const reduce = useReducedMotion();
  const pageVisible = usePageVisible();
  const [fault, setFault] = useState<string>(tour[0] ?? "Power issues");
  const [manual, setManual] = useState(false);

  useEffect(() => {
    if (!inView || !pageVisible || manual || reduce) return;
    let i = tour.indexOf(fault);
    const id = window.setInterval(() => { i = (i + 1) % tour.length; setFault(tour[i] ?? "Power issues"); }, 2600);
    return () => window.clearInterval(id);
    // restarting on every fault change would reset the cadence; only visibility/manual matter
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, pageVisible, manual, reduce]);

  return (
    <section ref={ref} data-live={inView && pageVisible ? "true" : "false"} data-tone="teal" aria-labelledby="repair-h" className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
      <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_1fr]">
        <RepairDiagnostic value={fault} onChange={(f) => { setManual(true); setFault(f); }} />
        <div>
          <SectionHeading title={<span id="repair-h">Game over?<br /><span className="text-gradient">Not yet.</span></span>}>
            Consoles and controllers, from power faults to analogue drift. Repairs are listed as typically completed in {site.repairTurnaround}.
          </SectionHeading>
          <div className="mt-8"><ControllerButton href="/repair-service" glyph="sq" size="lg">Request a repair</ControllerButton></div>
        </div>
      </div>
    </section>
  );
}
