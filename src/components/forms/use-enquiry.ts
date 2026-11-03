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

type EnquiryResponse = { ok: boolean; token?: string; error?: string; fieldErrors?: Errors; whatsappUrl?: string; retry?: boolean };

async function requestEnquiry(url: string, init: RequestInit, requests: Set<AbortController>) {
  const controller = new AbortController();
  requests.add(controller);
  const timer = window.setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    const data: EnquiryResponse = await response.json();
    return { ok: response.ok, data };
  } finally {
    window.clearTimeout(timer);
    requests.delete(controller);
  }
}

/** Shared submit flow: validate on the client, then on the server, with explicit success/error states. */
export function useEnquiry(formRef: React.RefObject<HTMLFormElement | null>) {
  const [state, setState] = useState<EnquiryState>({ status: "idle" });
  const [errors, setErrors] = useState<Errors>({});
  const token = useRef<string | null>(null);
  const tokenRequest = useRef<Promise<void> | null>(null);
  const requests = useRef(new Set<AbortController>());
  const mounted = useRef(true);
  const submitting = useRef(false);

  useEffect(() => {
    mounted.current = true;
    const pending = requests.current;
    return () => {
      mounted.current = false;
      pending.forEach((request) => request.abort());
      pending.clear();
    };
  }, []);

  /** Signed, single-use token proving the form was loaded (and not instantly bot-posted). */
  const fetchToken = useCallback(() => {
    if (tokenRequest.current) return tokenRequest.current;
    tokenRequest.current = (async () => {
      try {
        const { ok, data } = await requestEnquiry("/api/enquiry/token", { cache: "no-store" }, requests.current);
        if (mounted.current) token.current = ok && data.ok && data.token ? data.token : null;
      } catch {
        token.current = null;
      }
    })().finally(() => { tokenRequest.current = null; });
    return tokenRequest.current;
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
    if (!mounted.current) return;
    flushSync(() => {
      setErrors(fieldErrors);
      setState({ status: "error", message });
    });
    focusFirstInvalid();
  };

  async function submit(payload: Record<string, unknown>) {
    if (submitting.current) return;
    const parsed = enquirySchema.safeParse(payload);
    if (!parsed.success) {
      fail(z.flattenError(parsed.error).fieldErrors, "Please fix the highlighted fields.");
      return;
    }

    submitting.current = true;
    setErrors({});
    setState({ status: "submitting" });

    try {
      for (let attempt = 0; attempt < 2; attempt++) {
        if (!token.current) {
          await fetchToken();
          if (!token.current) throw new Error("Could not start enquiry session.");
          if (attempt > 0) await new Promise((r) => setTimeout(r, 2100)); // a fresh token must age past the human-speed floor
        }
        if (!mounted.current) return;
        const { ok, data } = await requestEnquiry("/api/enquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, _t: token.current }) }, requests.current);
        token.current = null; // Single use; a fresh one is fetched before any retry.
        if (!mounted.current) return;

        if (ok && data.ok && data.whatsappUrl) {
          setState({ status: "success", whatsappUrl: data.whatsappUrl });
          return;
        }
        if (data.retry && attempt === 0) continue; // submitted faster than a person plausibly can: quietly retry once
        void fetchToken(); // the token was consumed by this attempt; get a fresh one for the next
        fail(data.fieldErrors ?? {}, data.error ?? "Something went wrong. Please try again.");
        return;
      }
    } catch {
      token.current = null;
      fail({}, "We couldn’t reach the server. Check your connection and try again.");
    } finally {
      submitting.current = false;
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
