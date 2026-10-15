"use client";

import { useId, type ReactNode } from "react";
import { branchChoices, contactMethods } from "@/lib/validation";

export const inputClass =
  "min-h-12 w-full rounded-2xl border border-line-strong bg-surface px-4 text-base text-ink placeholder:text-muted/70 transition-[border-color,box-shadow] duration-200 focus:border-blue focus:outline-none focus:ring-4 focus:ring-blue/25 aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger/20";

export type Errors = Record<string, string[] | undefined>;

type FieldProps = { label: string; name: string; errors: Errors; hint?: string; required?: boolean; children: (p: { id: string; describedBy?: string; invalid: boolean }) => ReactNode; className?: string };

/** Label + control + inline error wiring, so every input is announced correctly. */
export function Field({ label, name, errors, hint, required = true, children, className = "" }: FieldProps) {
  const id = useId();
  const error = errors[name]?.[0];
  const errId = `${id}-err`;
  const hintId = `${id}-hint`;
  const describedBy = [error ? errId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold">
        {label} {!required && <span className="font-normal text-muted">(optional)</span>}
      </label>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {hint && !error && <p id={hintId} className="mt-1.5 text-xs text-muted">{hint}</p>}
      {error && <p id={errId} className="mt-1.5 text-sm font-medium text-danger">{error}</p>}
    </div>
  );
}

export function TextField({ label, name, errors, type = "text", autoComplete, hint, required, placeholder, inputMode, className }: { label: string; name: string; errors: Errors; type?: string; autoComplete?: string; hint?: string; required?: boolean; placeholder?: string; inputMode?: "text" | "tel" | "numeric"; className?: string }) {
  return (
    <Field label={label} name={name} errors={errors} hint={hint} required={required} className={className}>
      {({ id, describedBy, invalid }) => (
        <input id={id} name={name} type={type} autoComplete={autoComplete} inputMode={inputMode} placeholder={placeholder} aria-invalid={invalid} aria-describedby={describedBy} className={inputClass} />
      )}
    </Field>
  );
}

export function SelectField({ label, name, errors, options, placeholder = "Select…", value, onChange, className, required }: { label: string; name: string; errors: Errors; options: readonly string[]; placeholder?: string; value?: string; onChange?: (v: string) => void; className?: string; required?: boolean }) {
  return (
    <Field label={label} name={name} errors={errors} className={className} required={required}>
      {({ id, describedBy, invalid }) => (
        <select id={id} name={name} aria-invalid={invalid} aria-describedby={describedBy} className={inputClass} {...(onChange ? { value, onChange: (e) => onChange(e.target.value) } : { defaultValue: "" })}>
          <option value="" disabled>{placeholder}</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      )}
    </Field>
  );
}

export function TextAreaField({ label, name, errors, placeholder, hint, required, rows = 4 }: { label: string; name: string; errors: Errors; placeholder?: string; hint?: string; required?: boolean; rows?: number }) {
  return (
    <Field label={label} name={name} errors={errors} hint={hint} required={required}>
      {({ id, describedBy, invalid }) => (
        <textarea id={id} name={name} rows={rows} placeholder={placeholder} aria-invalid={invalid} aria-describedby={describedBy} className={`${inputClass} resize-y py-3`} />
      )}
    </Field>
  );
}

/** Controller-style single-choice pills (native radios underneath). */
export function PillRadio({ legend, name, options, errors, defaultValue }: { legend: string; name: string; options: readonly string[]; errors: Errors; defaultValue?: string }) {
  const error = errors[name]?.[0];
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label key={o} className="relative">
            <input type="radio" name={name} value={o} defaultChecked={o === defaultValue} className="peer sr-only" />
            <span className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-line-strong bg-surface px-4 text-sm font-medium transition-all duration-200 touch-manipulation hover:border-blue peer-checked:border-transparent peer-checked:bg-gradient-to-b peer-checked:from-fill peer-checked:to-fill-2 peer-checked:text-accent-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink peer-active:scale-95">
              {o}
            </span>
          </label>
        ))}
      </div>
      {error && <p className="mt-1.5 text-sm font-medium text-danger">{error}</p>}
    </fieldset>
  );
}

export function ContactBlock({ errors }: { errors: Errors }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <TextField label="Your name" name="name" errors={errors} autoComplete="name" />
      <TextField label="Mobile number" name="phone" errors={errors} type="tel" inputMode="tel" autoComplete="tel" placeholder="98765 43210" />
      <div className="sm:col-span-2">
        <PillRadio legend="Preferred contact method" name="contactMethod" options={contactMethods} errors={errors} defaultValue="WhatsApp" />
      </div>
      <SelectField label="Preferred branch" name="branch" errors={errors} options={branchChoices} placeholder="No preference" className="sm:col-span-2" required={false} />
      <Honeypot />
    </div>
  );
}

/** Hidden from people and assistive tech; bots that fill it are discarded server-side. */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>Leave this empty<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
    </div>
  );
}

/** Controller-style multi-choice pills (native checkboxes underneath). */
export function CheckPills({ legend, name, options, hint }: { legend: string; name: string; options: readonly string[]; hint?: string }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold">{legend} <span className="font-normal text-muted">(optional)</span></legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label key={o} className="relative">
            <input type="checkbox" name={name} value={o} className="peer sr-only" />
            <span className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-line-strong bg-surface px-4 text-sm font-medium transition-all duration-200 touch-manipulation hover:border-blue peer-checked:border-transparent peer-checked:bg-gradient-to-b peer-checked:from-fill peer-checked:to-fill-2 peer-checked:text-accent-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink peer-active:scale-95">
              {o}
            </span>
          </label>
        ))}
      </div>
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </fieldset>
  );
}
