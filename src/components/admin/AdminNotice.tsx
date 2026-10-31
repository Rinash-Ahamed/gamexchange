"use client";

import { useEffect, useState, type ReactNode } from "react";

/** Key each instance by its successful save token so repeated saves restart the timer. */
export function AdminNotice({ children, className = "", clearQuery = true }: { children: ReactNode; className?: string; clearQuery?: boolean }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const original = new URL(window.location.href);
    const timer = window.setTimeout(() => {
      setVisible(false);
      if (!clearQuery) return;
      const current = new URL(window.location.href);
      if (current.pathname !== original.pathname || current.searchParams.get("notice") !== original.searchParams.get("notice") || current.searchParams.get("saved") !== original.searchParams.get("saved")) return;
      current.searchParams.delete("notice");
      current.searchParams.delete("ticket");
      // Keep filters, form-reset tokens, hash and Next's history state intact.
      window.history.replaceState(window.history.state, "", current.pathname + current.search + current.hash);
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [clearQuery]);
  if (!visible) return null;
  return <p role="status" className={`rounded-xl border border-ok/30 bg-ok/10 px-4 py-3 text-sm text-ok ${className}`}>{children}</p>;
}
