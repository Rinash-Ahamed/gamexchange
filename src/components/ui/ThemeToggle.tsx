"use client";

import { useSyncExternalStore } from "react";
import { m, useReducedMotion } from "motion/react";
import { Moon, Sun } from "lucide-react";
import { THEME_KEY, type Theme } from "@/lib/theme";

const root = () => document.documentElement;

function readTheme(): Theme {
  return root().getAttribute("data-theme") === "light" ? "light" : "dark";
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(root(), { attributes: true, attributeFilter: ["data-theme"] });

  // Follow the OS setting live, but only while the visitor has not chosen a theme.
  const media = window.matchMedia("(prefers-color-scheme: light)");
  const onSystem = () => {
    let stored: string | null = null;
    try { stored = localStorage.getItem(THEME_KEY); } catch { /* storage unavailable */ }
    if (stored === "light" || stored === "dark") return;
    applyTheme(media.matches ? "light" : "dark", false);
  };
  media.addEventListener("change", onSystem);

  return () => {
    observer.disconnect();
    media.removeEventListener("change", onSystem);
  };
}

function applyTheme(next: Theme, animate: boolean) {
  const el = root();
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (animate && !reduce) {
    el.classList.add("theme-anim");
    window.setTimeout(() => el.classList.remove("theme-anim"), 360);
  }
  el.setAttribute("data-theme", next);
  el.style.colorScheme = next;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", next === "light" ? "#f3f6fc" : "#07090f");
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, readTheme, () => "dark" as Theme);
  const reduce = useReducedMotion();
  const isLight = theme === "light";

  const toggle = () => {
    const next: Theme = isLight ? "dark" : "light";
    applyTheme(next, true);
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
      className={`group relative grid size-11 shrink-0 place-items-center rounded-full border border-line-strong bg-surface-2 text-ink [box-shadow:var(--shadow-button)] ${className}`}
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
