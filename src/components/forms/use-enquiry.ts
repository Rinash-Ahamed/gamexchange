"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { z } from "zod";
import { enquirySchema } from "@/lib/validation";
import type { Errors } from "./fields";

export type EnquiryState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; whatsappUrl: string }
  | { status: "error"; message: string };

/** Shared submit flow: validate on the client, then on the server, with explicit success/error states. */
export function useEnquiry(formRef: React.RefObject<HTMLFormElement | null>) {
  const [state, setState] = useState<EnquiryState>({ status: "idle" });
  const [errors, setErrors] = useState<Errors>({});
  const token = useRef<string | null>(null);

  /** Signed, single-use token proving the form was loaded (and not instantly bot-posted). */
  const fetchToken = useCallback(async () => {
    try {
      const res = await fetch("/api/enquiry/token", { cache: "no-store" });
      const data: { ok: boolean; token?: string } = await res.json();
      token.current = data.ok && data.token ? data.token : null;
    } catch {
      token.current = null;
    }
  }, []);

  // Fetch lazily when the person first touches the form. Page views alone never hit the endpoint.
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const warm = () => void fetchToken();
    form.addEventListener("focusin", warm, { once: true });
    return () => form.removeEventListener("focusin", warm);
  }, [fetchToken, formRef]);

  const focusFirstInvalid = () => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();

  const fail = (fieldErrors: Errors, message: string) => {
    flushSync(() => {
      setErrors(fieldErrors);
      setState({ status: "error", message });
    });
    focusFirstInvalid();
  };

  async function submit(payload: Record<string, unknown>) {
    const parsed = enquirySchema.safeParse(payload);
    if (!parsed.success) {
      fail(z.flattenError(parsed.error).fieldErrors, "Please fix the highlighted fields.");
      return;
    }

    setErrors({});
    setState({ status: "submitting" });

    try {
      for (let attempt = 0; attempt < 2; attempt++) {
        if (!token.current) {
          await fetchToken();
          if (attempt > 0) await new Promise((r) => setTimeout(r, 2100)); // a fresh token must age past the human-speed floor
        }
        const res = await fetch("/api/enquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, _t: token.current }) });
        token.current = null; // Single use; a fresh one is fetched before any retry.
        const data: { ok: boolean; error?: string; fieldErrors?: Errors; whatsappUrl?: string; retry?: boolean } = await res.json();

        if (res.ok && data.ok && data.whatsappUrl) {
          setState({ status: "success", whatsappUrl: data.whatsappUrl });
          return;
        }
        if (data.retry && attempt === 0) continue; // submitted faster than a person plausibly can: quietly retry once
        void fetchToken(); // the token was consumed by this attempt; get a fresh one for the next
        fail(data.fieldErrors ?? {}, data.error ?? "Something went wrong. Please try again.");
        return;
      }
    } catch {
      fail({}, "We couldn’t reach the server. Check your connection and try again.");
    }
  }

  const reset = () => {
    setErrors({});
    setState({ status: "idle" });
  };

  return { state, errors, submit, reset };
}

/** Reads a form into a plain object; multi-value fields (checkboxes) become arrays. */
export function formToPayload(form: HTMLFormElement, kind: string, arrays: string[] = []) {
  const data = new FormData(form);
  const out: Record<string, unknown> = { kind };
  for (const key of new Set(data.keys())) {
    out[key] = arrays.includes(key) ? data.getAll(key).map(String) : String(data.get(key) ?? "");
  }
  for (const key of arrays) out[key] ??= [];
  return out;
}
