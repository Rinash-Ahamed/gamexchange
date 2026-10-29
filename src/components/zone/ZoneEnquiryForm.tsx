"use client";

import { useRef } from "react";
import { ContactBlock, SelectField, TextAreaField, TextField } from "@/components/forms/fields";
import { SubmitArea, SuccessPanel } from "@/components/forms/SubmitArea";
import { formToPayload, useEnquiry } from "@/components/forms/use-enquiry";
import { zoneStationNames } from "@/data/gamezone";

/** Honest enquiry flow: there is no live slot booking, so availability is confirmed by the shop. */
export function ZoneEnquiryForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const { state, errors, submit, reset } = useEnquiry(formRef);

  return (
    <div>
      {state.status === "success" && <SuccessPanel whatsappUrl={state.whatsappUrl} onEdit={reset} title="Session enquiry ready" />}
      <form
        ref={formRef}
        noValidate
        hidden={state.status === "success"}
        aria-label="Game zone enquiry"
        className="metal relative rounded-3xl p-6 sm:p-8"
        onSubmit={(e) => { e.preventDefault(); void submit(formToPayload(e.currentTarget, "gamezone")); }}
      >
        <h2 className="font-display text-2xl font-bold uppercase">Enquire about a session</h2>
        <p className="mt-1 text-sm text-muted">We don’t show live slot availability. The shop confirms timing when they reply.</p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <SelectField label="Station" name="station" errors={errors} options={zoneStationNames} />
          <SelectField label="Players" name="people" errors={errors} options={["1", "2", "3"]} />
          <TextField label="When would you like to come?" name="when" errors={errors} placeholder="e.g. Saturday evening" className="sm:col-span-2" />
          <div className="sm:col-span-2"><TextAreaField label="Anything else?" name="message" errors={errors} required={false} rows={3} /></div>
        </div>
        <div className="mt-5"><ContactBlock errors={errors} /></div>
        <SubmitArea state={state} label="Prepare enquiry" />
      </form>
    </div>
  );
}
