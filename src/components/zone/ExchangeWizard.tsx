"use client";

import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { m } from "motion/react";
import { z } from "zod";
import { exchangeAccessories, exchangeConditions, exchangeConsoles, exchangeUpgrades } from "@/data/repair";
import { enquirySchema } from "@/lib/validation";
import { CheckPills, ContactBlock, PillRadio, TextAreaField, type Errors } from "@/components/forms/fields";
import { SubmitArea, SuccessPanel } from "@/components/forms/SubmitArea";
import { formToPayload, useEnquiry } from "@/components/forms/use-enquiry";
import { ControllerButton } from "@/components/ui/ControllerButton";
import { Glyph, glyphTint, type GlyphName } from "@/components/ui/Glyph";

const steps: { title: string; glyph: GlyphName; fields: string[] }[] = [
  { title: "Your console", glyph: "x", fields: ["console"] },
  { title: "Condition", glyph: "o", fields: ["condition"] },
  { title: "Extras", glyph: "tri", fields: [] },
  { title: "Upgrade", glyph: "sq", fields: ["upgrade"] },
  { title: "Send", glyph: "x", fields: ["name", "phone", "contactMethod", "branch"] },
];

const required: Record<string, string> = {
  console: "Choose your console",
  condition: "Choose its condition",
  upgrade: "Choose what you’d like to upgrade to",
};

export function ExchangeWizard() {
  const formRef = useRef<HTMLFormElement>(null);
  const headings = useRef<(HTMLHeadingElement | null)[]>([]);
  const { state, errors: serverErrors, submit, reset } = useEnquiry(formRef);
  const [step, setStep] = useState(0);
  const [stepErrors, setStepErrors] = useState<Errors>({});
  const errors: Errors = { ...serverErrors, ...stepErrors };

  const goTo = (n: number) => {
    flushSync(() => setStep(n));
    headings.current[n]?.focus({ preventScroll: true });
  };

  const next = () => {
    const form = formRef.current;
    if (!form) return;
    const data = new FormData(form);
    const missing = Object.fromEntries((steps[step]?.fields ?? []).filter((f) => f in required && !data.get(f)).map((f) => [f, [required[f] ?? "Required"]]));
    flushSync(() => setStepErrors(missing));
    if (Object.keys(missing).length) {
      form.querySelector<HTMLElement>(`[name="${Object.keys(missing)[0]}"]`)?.focus();
      return;
    }
    goTo(step + 1);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload = formToPayload(e.currentTarget, "exchange", ["accessories"]);
    const check = enquirySchema.safeParse(payload);
    if (!check.success) {
      const keys = Object.keys(z.flattenError(check.error).fieldErrors);
      const first = steps.findIndex((s) => s.fields.some((f) => keys.includes(f)));
      if (first !== -1 && first !== step) flushSync(() => setStep(first));
    }
    setStepErrors({});
    void submit(payload);
  };

  return (
    <div>
      {state.status === "success" && <SuccessPanel whatsappUrl={state.whatsappUrl} onEdit={reset} title="Exchange enquiry ready" />}

      <form ref={formRef} onSubmit={onSubmit} noValidate hidden={state.status === "success"} aria-label="Trade-in and exchange enquiry" className="metal relative rounded-3xl p-6 sm:p-10">
        {/* HUD progress */}
        <ol className="relative mb-10 flex items-center justify-between">
          <span aria-hidden className="absolute inset-x-5 top-1/2 h-0.5 -translate-y-1/2 bg-line" />
          <m.span aria-hidden className="absolute left-5 top-1/2 h-0.5 -translate-y-1/2 origin-left bg-gradient-to-r from-fill to-fill-2" style={{ right: "1.25rem" }} initial={false} animate={{ scaleX: step / (steps.length - 1) }} transition={{ type: "spring", stiffness: 160, damping: 24 }} />
          {steps.map((s, i) => {
            const done = i < step;
            const current = i === step;
            return (
              <li key={s.title} aria-current={current ? "step" : undefined} className="relative flex flex-col items-center gap-2">
                <span className={`grid size-10 place-items-center rounded-full border transition-all duration-300 ${current ? "scale-110 border-transparent bg-gradient-to-b from-fill to-fill-2 text-accent-ink [box-shadow:var(--shadow-button)]" : done ? "border-blue bg-surface text-accent-text" : "border-line-strong bg-surface text-muted"}`} style={!current && !done ? { color: glyphTint[s.glyph] } : undefined}>
                  <Glyph name={s.glyph} className="size-4" />
                </span>
                <span className={`hidden text-[11px] font-semibold uppercase tracking-[0.14em] sm:block ${current ? "text-ink" : "text-muted"}`}>{s.title}</span>
              </li>
            );
          })}
        </ol>
        <p className="mb-6 text-xs font-semibold uppercase tracking-[0.3em] text-accent-text sm:hidden" aria-hidden>Step {step + 1} / {steps.length} · {steps[step]?.title}</p>

        {/* All panels stay mounted so answers persist; only the current one is shown. */}
        {steps.map((s, i) => (
          <m.div key={s.title} hidden={i !== step} initial={false} animate={i === step ? { opacity: 1, x: 0 } : { opacity: 0, x: 28 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="min-h-72">
            <h2 ref={(el) => { headings.current[i] = el; }} tabIndex={-1} className="font-display text-3xl font-bold uppercase outline-none sm:text-4xl">
              {i === 0 && "Which console do you have?"}
              {i === 1 && "What condition is it in?"}
              {i === 2 && "What’s included?"}
              {i === 3 && "What would you like to upgrade to?"}
              {i === 4 && "Almost there — how do we reach you?"}
            </h2>
            <div className="mt-6 space-y-6">
              {i === 0 && <PillRadio legend="Current console" name="console" options={exchangeConsoles} errors={errors} />}
              {i === 1 && <PillRadio legend="Condition (your own assessment)" name="condition" options={exchangeConditions} errors={errors} />}
              {i === 2 && (
                <>
                  <CheckPills legend="Accessories you’ll bring" name="accessories" options={exchangeAccessories} />
                  <TextAreaField label="Anything else we should know?" name="details" errors={errors} required={false} placeholder="Model, storage size, faults, scratches…" />
                </>
              )}
              {i === 3 && <PillRadio legend="Desired upgrade" name="upgrade" options={exchangeUpgrades} errors={errors} />}
              {i === 4 && <ContactBlock errors={errors} />}
            </div>
          </m.div>
        ))}

        <p className="mt-8 rounded-2xl border border-line p-4 text-sm text-muted">
          <strong className="text-ink">No instant valuation.</strong> We don’t estimate trade-in value online — the shop checks your device and confirms an offer in person.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          {step > 0 ? <ControllerButton onClick={() => goTo(step - 1)} glyph="o" variant="ghost">Back</ControllerButton> : <span />}
          {step < steps.length - 1 ? (
            <ControllerButton onClick={next} glyph="x">Next</ControllerButton>
          ) : null}
        </div>
        {step === steps.length - 1 && <SubmitArea state={state} label="Prepare enquiry" />}
      </form>
    </div>
  );
}
