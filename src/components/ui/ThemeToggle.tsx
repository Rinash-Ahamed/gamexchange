"use client";

import { useSyncExternalStore } from "react";
import { m, useReducedMotion } from "motion/react";
import { Moon, Sun } from "lucide-react";
import { millisecondsUntilThemeBoundary, scheduledTheme, THEME_KEY, type Theme } from "@/lib/theme";

const root = () => document.documentElement;
let fallbackTimer: number | undefined;

function readTheme(): Theme {
  return root().getAttribute("data-theme") === "light" ? "light" : "dark";
}

function readStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === "light" || stored === "dark" ? stored : null;
  } catch {
    return null;
  }
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(root(), { attributes: true, attributeFilter: ["data-theme"] });

  let timer: number | undefined;

  const schedule = () => {
    window.clearTimeout(timer);
    if (readStoredTheme()) return;

    timer = window.setTimeout(() => {
      applyTheme(scheduledTheme(), true);
      schedule();
    }, millisecondsUntilThemeBoundary() + 50);
  };

  const syncAutomaticTheme = () => {
    if (readStoredTheme()) return;
    applyTheme(scheduledTheme(), true);
    schedule();
  };

  const syncStoredTheme = (event: StorageEvent) => {
    if (event.key !== THEME_KEY && event.key !== null) return;
    applyTheme(readStoredTheme() ?? scheduledTheme(), true);
    schedule();
  };

  const syncWhenVisible = () => {
    if (document.visibilityState === "visible") syncAutomaticTheme();
  };

  schedule();
  window.addEventListener("storage", syncStoredTheme);
  window.addEventListener("focus", syncAutomaticTheme);
  document.addEventListener("visibilitychange", syncWhenVisible);

  return () => {
    observer.disconnect();
    window.clearTimeout(timer);
    window.removeEventListener("storage", syncStoredTheme);
    window.removeEventListener("focus", syncAutomaticTheme);
    document.removeEventListener("visibilitychange", syncWhenVisible);
  };
}

function applyTheme(next: Theme, animate: boolean) {
  const el = root();
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (readTheme() === next) return;

  const commit = () => {
    el.setAttribute("data-theme", next);
    el.style.colorScheme = next;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", next === "light" ? "#f3f6fc" : "#07090f");
  };

  window.clearTimeout(fallbackTimer);
  // Apply background and reduced-motion updates immediately, without animation.
  if (!animate || reduce || document.visibilityState !== "visible") {
    el.classList.remove("theme-anim-fallback");
    commit();
    return;
  }

  // A short CSS colour fade avoids document snapshots and their hidden-tab aborts.
  // Commit synchronously so tab suspension cannot delay the actual theme change.
  el.classList.add("theme-anim-fallback");
  commit();
  fallbackTimer = window.setTimeout(() => el.classList.remove("theme-anim-fallback"), 220);
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, readTheme, () => "dark" as Theme);
  const reduce = useReducedMotion();
  const isLight = theme === "light";

  const toggle = () => {
    const next: Theme = isLight ? "dark" : "light";
    applyTheme(next, true);
    // An explicit choice overrides automatic scheduling on future visits.
    try { localStorage.setItem(THEME_KEY, next); } catch { /* storage unavailable */ }
    navigator.vibrate?.(8);
  };

  return (
    <m.button
      type="button"
      onClick={toggle}
      aria-label={isLight ? "Switch to dark theme" : "Switch to light theme"}
      title={isLight ? "Dark mode" : "Light mode"}
      whileTap={reduce ? undefined : { y: 4, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 520, damping: 22 }}
      className={`group relative grid size-11 shrink-0 place-items-center rounded-full border border-line-strong bg-surface-2 text-ink ${className}`}
    >
      <span aria-hidden className="pointer-events-none absolute inset-[3px] rounded-full bg-gradient-to-b from-white/10 to-transparent" />
      <m.span
        aria-hidden
        className="relative grid place-items-center"
        initial={false}
        animate={{ rotate: isLight ? 0 : 360 }}
        transition={reduce ? { duration: 0 } : { duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        {isLight ? <Sun className="size-5 text-accent-text" /> : <Moon className="size-5 text-accent-text" />}
      </m.span>
    </m.button>
  );
}
