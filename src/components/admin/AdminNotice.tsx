"use client";

import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, CircleAlert } from "lucide-react";

const subscribe = () => () => {};
const noticeHost = () => document.getElementById("admin-notices");
const serverHost = () => null;

/** A new result object/token restarts the timer even when its message is unchanged. */
export function AdminNotice({ children, className = "", clearQuery = true, variant = "success", eventKey }: { children: ReactNode; className?: string; clearQuery?: boolean; variant?: "success" | "error"; eventKey?: unknown }) {
  const host = useSyncExternalStore(subscribe, noticeHost, serverHost);
  const token = eventKey ?? children;
  const [dismissed, setDismissed] = useState<{ token: unknown } | null>(null);
  useEffect(() => {
    if (!host) return;
    const original = new URL(window.location.href);
    const timer = window.setTimeout(() => {
      setDismissed({ token });
      if (!clearQuery) return;
      const current = new URL(window.location.href);
      if (current.pathname !== original.pathname || ["notice", "error", "saved"].some((key) => current.searchParams.get(key) !== original.searchParams.get(key))) return;
      current.searchParams.delete("notice");
      current.searchParams.delete("error");
      current.searchParams.delete("ticket");
      // Keep filters, form-reset tokens, hash and Next's history state intact.
      window.history.replaceState(window.history.state, "", current.pathname + current.search + current.hash);
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [clearQuery, host, token]);
  if (!host || dismissed?.token === token) return null;
  const failed = variant === "error";
  const Icon = failed ? CircleAlert : CheckCircle2;
  return createPortal(<div role={failed ? "alert" : "status"} aria-atomic="true" data-admin-notice={variant}
    className={`pointer-events-auto flex items-start gap-3 rounded-xl border bg-surface px-4 py-3 text-sm shadow-lg ${failed ? "border-danger text-danger" : "border-ok text-ok"} ${className}`}>
    <Icon className="mt-0.5 size-5 shrink-0" aria-hidden /><p className="min-w-0 break-words leading-6">{children}</p>
  </div>, host);
}
