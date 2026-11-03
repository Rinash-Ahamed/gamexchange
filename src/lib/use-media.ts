"use client";

import { useCallback, useSyncExternalStore } from "react";

type MediaStore = { subscribe: (notify: () => void) => () => void; snapshot: () => boolean };
const stores = new Map<string, MediaStore>();

function mediaStore(query: string): MediaStore {
  const existing = stores.get(query);
  if (existing) return existing;
  let media: MediaQueryList | undefined;
  const listeners = new Set<() => void>();
  const getMedia = () => media ??= window.matchMedia(query);
  const changed = () => listeners.forEach((notify) => notify());
  const store: MediaStore = {
    snapshot: () => getMedia().matches,
    subscribe: (notify) => {
      if (!listeners.size) getMedia().addEventListener("change", changed);
      listeners.add(notify);
      return () => {
        listeners.delete(notify);
        if (!listeners.size) getMedia().removeEventListener("change", changed);
      };
    },
  };
  stores.set(query, store);
  return store;
}

/** Subscribes to a CSS media query without effects; falls back to `serverValue` during SSR. */
export function useMedia(query: string, serverValue = false) {
  const store = mediaStore(query);
  const serverSnapshot = useCallback(() => serverValue, [serverValue]);
  return useSyncExternalStore(store.subscribe, store.snapshot, serverSnapshot);
}

export const useFinePointer = () => useMedia("(hover: hover) and (pointer: fine)");
