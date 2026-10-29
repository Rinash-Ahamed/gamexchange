"use client";

import { useSyncExternalStore } from "react";

const subscribe = (notify: () => void) => {
  document.addEventListener("visibilitychange", notify);
  return () => document.removeEventListener("visibilitychange", notify);
};
const visible = () => !document.hidden;
const serverVisible = () => true;

export const usePageVisible = () => useSyncExternalStore(subscribe, visible, serverVisible);
