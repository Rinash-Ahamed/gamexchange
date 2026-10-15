"use client";

import { useRef } from "react";
import { ContactBlock, TextAreaField } from "@/components/forms/fields";
import { SubmitArea, SuccessPanel } from "@/components/forms/SubmitArea";
import { formToPayload, useEnquiry } from "@/components/forms/use-enquiry";

export function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const { state, errors, submit, reset } = useEnquiry(formRef);

  return (
    <div>
      {state.status === "success" && <SuccessPanel whatsappUrl={state.whatsappUrl} onEdit={reset} title="Message ready" />}
      <form
        ref={formRef}
        noValidate
        hidden={state.status === "success"}
        aria-label="Contact form"
        className="metal relative rounded-3xl p-6 sm:p-8"
        onSubmit={(e) => { e.preventDefault(); void submit(formToPayload(e.currentTarget, "contact")); }}
      >
        <h2 className="font-display text-2xl font-bold uppercase">Send us a message</h2>
        <div className="mt-6 space-y-5">
          <TextAreaField label="How can we help?" name="message" errors={errors} rows={5} />
          <ContactBlock errors={errors} />
        </div>
        <SubmitArea state={state} label="Prepare message" />
      </form>
    </div>
  );
}
