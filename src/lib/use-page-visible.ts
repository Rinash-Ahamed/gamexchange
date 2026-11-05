"use client";

import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>();
const changed = () => listeners.forEach((notify) => notify());
const subscribe = (notify: () => void) => {
  if (!listeners.size) document.addEventListener("visibilitychange", changed);
  listeners.add(notify);
  return () => {
    listeners.delete(notify);
    if (!listeners.size) document.removeEventListener("visibilitychange", changed);
  };
};
const visible = () => !document.hidden;
const serverVisible = () => true;

export const usePageVisible = () => useSyncExternalStore(subscribe, visible, serverVisible);
