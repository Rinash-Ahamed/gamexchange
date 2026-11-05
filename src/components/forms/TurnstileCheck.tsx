"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

type TurnstileApi = { render: (element: HTMLElement, options: Record<string, unknown>) => string; remove: (id: string) => void };
declare global { interface Window { turnstile?: TurnstileApi } }

/** Mounted only by Contact and Repair. No wrapper dependency or app-wide script. */
export function TurnstileCheck({ action }: { action: "contact" | "repair" }) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  const container = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const api = window.turnstile;
    if (!ready || !siteKey || !api || !container.current) return;
    let active = true;
    let id: string | undefined;
    try { id = api.render(container.current, {
      sitekey: siteKey, action, theme: document.documentElement.dataset.theme === "light" ? "light" : "dark", size: "compact", "response-field": false,
      callback: (value: string) => { if (active) { setToken(value); setError(""); } },
      "expired-callback": () => { if (active) { setToken(""); setError("Security check expired. Please try it again."); } },
      "error-callback": () => { if (active) { setToken(""); setError("Security check could not finish. Please retry."); } },
    }); } catch {
      queueMicrotask(() => { if (active) setError("Security check could not start. Please retry or refresh the page."); });
    }
    const theme = new MutationObserver(() => { if (active) { setToken(""); setAttempt((value) => value + 1); } });
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => { active = false; theme.disconnect(); if (id !== undefined) api.remove(id); };
  }, [ready, siteKey, action, attempt]);
  if (!siteKey) return null;
  return <div className="min-w-0 max-w-full sm:max-w-xs" aria-label="Security check">
    <Script id="cloudflare-turnstile" src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onReady={() => setReady(true)} onError={() => { setToken(""); setError("Security check could not load. Check your connection and refresh the page."); }} />
    <input type="hidden" name="turnstileToken" value={token} />
    <div ref={container} className="min-h-[140px] w-[150px] max-w-full" />
    {error && <p role="alert" className="mt-2 text-sm text-danger">{error} {ready && <button type="button" onClick={() => { setToken(""); setError(""); setAttempt((value) => value + 1); }} className="text-accent-text underline">Retry security check</button>}</p>}
  </div>;
}
