"use client";

import { useRef, useState } from "react";
import { repairCategories, repairDevices, repairFaults } from "@/data/repair";
import { ContactBlock, SelectField, TextAreaField } from "@/components/forms/fields";
import { SubmitArea, SuccessPanel } from "@/components/forms/SubmitArea";
import { formToPayload, useEnquiry } from "@/components/forms/use-enquiry";
import { RepairDiagnostic } from "./RepairDiagnostic";

export function RepairExperience() {
  const formRef = useRef<HTMLFormElement>(null);
  const { state, errors, submit, reset } = useEnquiry(formRef);
  const [category, setCategory] = useState("");
  const [device, setDevice] = useState("");
  const [fault, setFault] = useState("");

  const devices = category === "Console" || category === "Accessories" ? repairDevices[category] : [];

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void submit(formToPayload(e.currentTarget, "repair"));
  };

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_1.1fr]">
      <RepairDiagnostic value={fault || null} onChange={setFault} />

      <div>
        {state.status === "success" && <SuccessPanel whatsappUrl={state.whatsappUrl} onEdit={reset} title="Repair enquiry ready" />}

        <form ref={formRef} onSubmit={onSubmit} noValidate hidden={state.status === "success"} className="metal relative rounded-3xl p-6 sm:p-8" aria-label="Repair enquiry">
          <h2 className="font-display text-2xl font-bold uppercase">Request a repair</h2>
          <p className="mt-1 text-sm text-muted">Tell us what’s wrong. The shop will review it and reply — nothing is booked until they confirm.</p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <SelectField label="Device category" name="category" errors={errors} options={repairCategories} value={category} onChange={(v) => { setCategory(v); setDevice(""); }} />
            <SelectField label="Device model" name="device" errors={errors} options={devices} value={device} onChange={setDevice} placeholder={category ? "Select…" : "Choose a category first"} />
            <SelectField label="Issue" name="fault" errors={errors} options={repairFaults} value={fault} onChange={setFault} className="sm:col-span-2" />
            <div className="sm:col-span-2">
              <TextAreaField label="Describe the issue" name="details" errors={errors} placeholder="What happens, when it started, anything you’ve already tried…" />
            </div>
          </div>

          <div className="mt-5"><ContactBlock errors={errors} /></div>
          <SubmitArea state={state} label="Prepare enquiry" />
        </form>
      </div>
    </div>
  );
}
