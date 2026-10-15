"use client";

import { useSyncExternalStore } from "react";

/** Subscribes to a CSS media query without effects; falls back to `serverValue` during SSR. */
export function useMedia(query: string, serverValue = false) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

export const useFinePointer = () => useMedia("(hover: hover) and (pointer: fine)");
