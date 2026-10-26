"use client";

import { CircleCheck, LoaderCircle, TriangleAlert } from "lucide-react";
import { ControllerButton } from "@/components/ui/ControllerButton";
import type { GlyphName } from "@/components/ui/Glyph";
import type { EnquiryState } from "./use-enquiry";

export function SubmitArea({ state, label, glyph = "x" }: { state: EnquiryState; label: string; glyph?: GlyphName }) {
  return (
    <div className="mt-8 space-y-4">
      {state.status === "error" && (
        <p role="alert" className="flex items-start gap-3 rounded-2xl border border-danger/50 bg-danger/10 p-4 text-sm font-medium text-danger">
          <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
          {state.message}
        </p>
      )}
      <ControllerButton type="submit" glyph={glyph} size="lg" disabled={state.status === "submitting"}>
        {state.status === "submitting" ? (
          <span className="inline-flex items-center gap-2"><LoaderCircle className="size-4 animate-spin" aria-hidden />Preparing…</span>
        ) : label}
      </ControllerButton>
    </div>
  );
}

/**
 * No booking backend exists yet, so success means "ready to send", never "booked".
 * The customer completes the enquiry by sending the pre-filled WhatsApp message.
 */
export function SuccessPanel({ whatsappUrl, onEdit, title = "Your enquiry is ready" }: { whatsappUrl: string; onEdit: () => void; title?: string }) {
  return (
    <div ref={(el) => el?.focus()} tabIndex={-1} role="status" className="metal rounded-3xl p-7 text-center outline-none sm:p-10">
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-ok/15 text-ok"><CircleCheck className="size-9" aria-hidden /></span>
      <h2 className="mt-5 font-display text-3xl font-bold uppercase">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-muted">
        One last step: send it on WhatsApp so the shop receives it. <strong className="text-ink">Nothing is booked or confirmed until the shop replies.</strong>
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <ControllerButton href={whatsappUrl} external glyph="play" size="lg">Send on WhatsApp</ControllerButton>
        <ControllerButton onClick={onEdit} glyph="o" size="lg" variant="ghost">Edit enquiry</ControllerButton>
      </div>
    </div>
  );
}
