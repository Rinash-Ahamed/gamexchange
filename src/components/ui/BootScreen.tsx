"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { BOOT_SCREEN_KEY } from "@/lib/boot-screen";

type Phase = "booting" | "leaving" | "hidden";

export function BootScreen() {
  const [phase, setPhase] = useState<Phase>("booting");
  const screen = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(BOOT_SCREEN_KEY) === "1") {
        const hideFrame = window.requestAnimationFrame(() => setPhase("hidden"));
        return () => window.cancelAnimationFrame(hideFrame);
      }
      sessionStorage.setItem(BOOT_SCREEN_KEY, "1");
    } catch {
      // The intro still works when browser storage is unavailable.
    }

    const shell = document.querySelector<HTMLElement>("[data-site-shell]");
    const skipLink = document.getElementById("skip-to-content");
    const previousOverflow = document.body.style.overflow;
    shell?.setAttribute("inert", "");
    skipLink?.setAttribute("inert", "");
    document.body.style.overflow = "hidden";
    screen.current?.focus({ preventScroll: true });
    let unlocked = false;
    const unlockSite = () => {
      if (unlocked) return;
      unlocked = true;
      shell?.removeAttribute("inert");
      skipLink?.removeAttribute("inert");
      document.body.style.overflow = previousOverflow;
    };

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const leaveAfter = reducedMotion ? 350 : 1400;
    const hideAfter = reducedMotion ? 450 : 1800;

    const leaveTimer = window.setTimeout(() => setPhase("leaving"), leaveAfter);
    const hideTimer = window.setTimeout(() => {
      unlockSite();
      setPhase("hidden");
      document.documentElement.classList.add("boot-seen");
    }, hideAfter);

    const skip = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      window.clearTimeout(leaveTimer);
      window.clearTimeout(hideTimer);
      unlockSite();
      setPhase("hidden");
      document.documentElement.classList.add("boot-seen");
    };
    window.addEventListener("keydown", skip);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(hideTimer);
      window.removeEventListener("keydown", skip);
      unlockSite();
    };
  }, []);

  if (phase === "hidden") return null;

  return (
    <div
      ref={screen}
      role="status"
      aria-live="polite"
      aria-label="GamexChange is starting"
      tabIndex={-1}
      className={`boot-screen ${phase === "leaving" ? "boot-screen-leaving" : ""}`}
    >
      <div aria-hidden className="boot-grid" />
      <div aria-hidden className="boot-scan" />
      <span aria-hidden className="boot-corner boot-corner-tl" />
      <span aria-hidden className="boot-corner boot-corner-tr" />
      <span aria-hidden className="boot-corner boot-corner-bl" />
      <span aria-hidden className="boot-corner boot-corner-br" />

      <div className="boot-console">
        <p className="boot-kicker">System boot / Player 01</p>
        <div className="boot-reactor" aria-hidden>
          <span className="boot-reactor-ring" />
          <span className="boot-reactor-ring boot-reactor-ring-inner" />
          <Image src="/brand/gamexchange-mark.png" alt="" width={256} height={256} priority className="boot-mark" />
        </div>
        <Image
          src="/brand/gamexchange-logo-900.png"
          alt="GamexChange"
          width={900}
          height={368}
          priority
          className="boot-wordmark"
        />

        <div className="boot-progress" aria-hidden><span /></div>
        <div className="boot-status" aria-hidden>
          <span>Loading player profile</span>
          <span>Syncing inventory</span>
          <span>Opening lobby</span>
          <span>Ready</span>
        </div>
        <p className="boot-hint">Press Esc to skip</p>
      </div>
    </div>
  );
}
