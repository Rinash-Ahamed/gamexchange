"use client";

import { useRef, useState } from "react";
import { repairCategories, repairDevices, repairFaults } from "@/data/repair";
import { ContactBlock, Field, inputClass, SelectField, TextAreaField, TextField } from "@/components/forms/fields";
import { TurnstileCheck } from "@/components/forms/TurnstileCheck";
import { ControllerButton } from "@/components/ui/ControllerButton";
import Link from "next/link";
import { SubmitArea, SuccessPanel } from "@/components/forms/SubmitArea";
import { formToPayload, useEnquiry } from "@/components/forms/use-enquiry";
import { RepairDiagnostic } from "./RepairDiagnostic";

export function RepairExperience() {
  const formRef = useRef<HTMLFormElement>(null);
  const { state, errors, submit, reset, challengeResetKey, clearFieldError } = useEnquiry(formRef);
  const [category, setCategory] = useState("");
  const [device, setDevice] = useState("");
  const [faults, setFaults] = useState<string[]>([]);
  const [delivery, setDelivery] = useState("whatsapp");
  const toggleFault = (fault: string) => {
    clearFieldError("fault");
    setFaults((current) => current.includes(fault) ? current.filter((item) => item !== fault) : [...current, fault]);
  };

  const devices = category === "Console" || category === "Accessories" ? repairDevices[category] : [];

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload = formToPayload(e.currentTarget, "repair", ["fault"]);
    if (delivery === "callback") payload.callbackConsent = payload.callbackConsent === "on";
    void submit(payload);
  };

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_1.1fr]">
      <RepairDiagnostic values={faults} onChange={toggleFault} />

      <div>
        {state.status === "success" && <SuccessPanel whatsappUrl={state.whatsappUrl} onEdit={reset} title="Repair enquiry ready" />}
        {state.status === "callback-saved" && <div role="status" tabIndex={-1} ref={(element) => element?.focus()} className="metal rounded-3xl p-7 text-center outline-none sm:p-10">
          <h2 className="font-display text-3xl font-bold uppercase">Callback requested</h2>
          <p className="mt-3 text-muted">Your request has been saved. The GameXchange team can call you to discuss your repair. A repair is not booked yet.</p>
          <p className="mt-3 break-all font-semibold">Reference: {state.ticketNumber}</p>
          <div className="mt-6"><ControllerButton onClick={reset} glyph="o" variant="ghost">New enquiry</ControllerButton></div>
        </div>}

        <form ref={formRef} onSubmit={onSubmit} noValidate hidden={state.status === "success" || state.status === "callback-saved"} className="metal relative rounded-3xl p-6 sm:p-8" aria-label="Repair enquiry">
          <h2 className="font-display text-2xl font-bold uppercase">Request a repair</h2>
          <p className="mt-1 text-sm text-muted">Tell us what’s wrong. The shop will review it and reply. Nothing is booked until they confirm.</p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <SelectField label="Device category" name="category" errors={errors} options={repairCategories} value={category} onChange={(v) => { setCategory(v); setDevice(""); }} />
            <SelectField label="Device model" name="device" errors={errors} options={devices} value={device} onChange={setDevice} placeholder={category ? "Select…" : "Choose a category first"} />
            {device === "Other" && <TextField label="Your device model" name="deviceOther" errors={errors} required maxLength={120} placeholder="Enter the brand and model" className="sm:col-span-2" />}
            <fieldset className="min-w-0 sm:col-span-2" aria-describedby={errors.fault ? "repair-issues-hint repair-issues-error" : "repair-issues-hint"}>
              <legend className="text-sm font-semibold">Issues with your device</legend>
              <p id="repair-issues-hint" className="mb-3 mt-1 text-xs text-muted">Select all that apply. You can choose more than one issue.</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {repairFaults.map((fault) => (
                  <label key={fault} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-line-strong bg-surface px-3 py-2 text-sm has-checked:border-blue has-checked:bg-blue/10">
                    <input type="checkbox" name="fault" value={fault} checked={faults.includes(fault)} onChange={() => toggleFault(fault)} aria-invalid={Boolean(errors.fault)} aria-describedby={errors.fault ? "repair-issues-error" : undefined} className="size-4 shrink-0 accent-blue" />
                    {fault}
                  </label>
                ))}
              </div>
              {errors.fault && <p id="repair-issues-error" className="mt-2 text-sm font-medium text-danger">{errors.fault[0]}</p>}
            </fieldset>
            <div className="sm:col-span-2">
              <TextAreaField label="Describe the issue" name="details" errors={errors} placeholder="What happens, when it started, anything you’ve already tried…" />
            </div>
          </div>

          <div className="mt-5 space-y-5">
            <Field label="How would you like to contact us?" name="delivery" errors={errors}>
              {({ id, describedBy, invalid }) => <select id={id} name="delivery" value={delivery} onChange={(event) => setDelivery(event.target.value)} aria-invalid={invalid} aria-describedby={describedBy} className={inputClass}>
                <option value="whatsapp">Send on WhatsApp</option><option value="callback">Request a callback</option>
              </select>}
            </Field>
            <ContactBlock errors={errors} phoneCall={delivery === "callback"} />
            {delivery === "callback" && <Field label="Callback consent" name="callbackConsent" errors={errors}>
              {({ id, describedBy, invalid }) => <div className="flex items-start gap-3 text-sm leading-6"><input id={id} name="callbackConsent" type="checkbox" required aria-invalid={invalid} aria-describedby={describedBy} className="mt-1 size-4 shrink-0 accent-blue" /><label htmlFor={id}>I agree that GameXchange may save my repair details and call me about this request. <Link href="/policies/privacy-policy" className="text-accent-text underline">Privacy Policy</Link></label></div>}
            </Field>}
          </div>
          <SubmitArea state={state} label={delivery === "callback" ? "Request a callback" : "Prepare enquiry"} glyph={delivery === "callback" ? "play" : "x"} securityCheck={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() && state.status !== "success" && state.status !== "callback-saved" ? <TurnstileCheck key={challengeResetKey} action="repair" /> : undefined} />
        </form>
      </div>
    </div>
  );
}
