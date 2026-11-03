"use client";

import { useEffect, useRef, useState } from "react";
import { ADMIN_ACTIVITY_INTERVAL_MS, ADMIN_IDLE_WARNING_MS } from "@/lib/admin/idle-policy";
import { adminButtonClass } from "./styles";

const endpoint = "/api/admin/session/activity";

export function AdminIdleSession({ idleExpiresAt }: { idleExpiresAt: number }) {
  const [seconds, setSeconds] = useState<number | null>(null);
  const [checking, setChecking] = useState(false);
  const keepAlive = useRef<() => void>(() => {});

  useEffect(() => {
    let deadline = idleExpiresAt;
    let clockOffset = 0;
    let lastInteraction = 0;
    let lastSent = 0;
    let dirty = false;
    let stopped = false;
    let pending = false;
    let controller: AbortController | undefined;
    const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("gamexchange-admin-session") : null;
    const now = () => Date.now() + clockOffset;

    const leave = () => {
      if (stopped) return;
      stopped = true;
      setChecking(true);
      // Hard navigation removes protected UI and in-memory router snapshots.
      window.location.replace("/admin/login?reason=idle");
    };

    const paintWarning = () => {
      const remaining = deadline - now();
      setSeconds(remaining <= ADMIN_IDLE_WARNING_MS ? Math.max(0, Math.ceil(remaining / 1000)) : null);
    };

    const sync = async (active: boolean) => {
      if (pending || stopped) return;
      const idleForMs = Math.max(0, now() - lastInteraction);
      if (active && idleForMs > ADMIN_ACTIVITY_INTERVAL_MS) { dirty = false; return; }
      pending = true;
      if (active) { dirty = false; lastSent = now(); }
      controller = new AbortController();
      const timeout = window.setTimeout(() => controller?.abort(), 8000);
      try {
        const response = await fetch(endpoint, {
          method: active ? "POST" : "GET",
          headers: active ? { "x-admin-idle-ms": String(idleForMs) } : undefined,
          cache: "no-store", credentials: "same-origin", signal: controller.signal,
        });
        if (stopped) return;
        if (response.status === 401) { leave(); return; }
        if (!response.ok) throw new Error("Session unavailable");
        const result = await response.json() as { idleExpiresAt: number; serverNow: number };
        if (!Number.isFinite(result.idleExpiresAt) || !Number.isFinite(result.serverNow)) throw new Error("Invalid session response");
        clockOffset = result.serverNow - Date.now();
        deadline = result.idleExpiresAt;
        if (active) channel?.postMessage("activity");
        setChecking(false);
        paintWarning();
      } catch {
        // Never extend an unconfirmed deadline, including when offline/asleep.
        if (!stopped && now() >= deadline) leave();
      } finally {
        window.clearTimeout(timeout);
        pending = false;
      }
    };

    const activity = (event?: Event) => {
      if (stopped || document.hidden || (event && !event.isTrusted)) return;
      if (now() >= deadline) { setChecking(true); void sync(false); return; }
      lastInteraction = now();
      dirty = true;
      if (now() - lastSent >= ADMIN_ACTIVITY_INTERVAL_MS) void sync(true);
    };
    keepAlive.current = () => {
      // An explicit warning-button click can refresh immediately.
      lastSent = 0;
      activity();
    };
    const resume = () => {
      if (!document.hidden) void sync(false);
    };
    const broadcast = () => { void sync(false); };
    channel?.addEventListener("message", broadcast);
    const events = ["pointerdown", "pointermove", "keydown", "wheel", "touchstart", "touchmove"] as const;
    for (const event of events) window.addEventListener(event, activity, { passive: true });
    document.addEventListener("visibilitychange", resume);
    window.addEventListener("focus", resume);
    window.addEventListener("pageshow", resume);
    // Mounts, route changes and the timer itself do not count as user activity.
    void sync(false);
    const timer = window.setInterval(() => {
      if (stopped) return;
      paintWarning();
      if (now() >= deadline) {
        setChecking(true);
        void sync(false); // Another admin tab may have legitimately extended it.
      } else if (dirty && now() - lastSent >= ADMIN_ACTIVITY_INTERVAL_MS) {
        void sync(true);
      }
    }, 1000);

    return () => {
      stopped = true;
      controller?.abort();
      window.clearInterval(timer);
      channel?.close();
      for (const event of events) window.removeEventListener(event, activity);
      document.removeEventListener("visibilitychange", resume);
      window.removeEventListener("focus", resume);
      window.removeEventListener("pageshow", resume);
      keepAlive.current = () => {};
    };
  }, [idleExpiresAt]);

  if (seconds === null && !checking) return null;
  return (
    <div className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-lg rounded-xl border border-line-strong bg-surface p-4 text-ink shadow-lg sm:inset-x-6" role="region" aria-label="Admin session timeout">
      <p role="status" className="text-sm font-semibold">{checking ? "Checking your session..." : "Your admin session is about to expire."}</p>
      {!checking && <>
        <p className="mt-1 text-sm text-muted">You will be signed out in <span className="tabular-nums">{seconds}</span> seconds. Save any unfinished edits.</p>
        <button type="button" className={`${adminButtonClass} mt-3`} onClick={() => keepAlive.current()}>Stay signed in</button>
      </>}
    </div>
  );
}
