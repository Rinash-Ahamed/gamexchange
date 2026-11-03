"use client";

import type { Ref } from "react";
import { TextField } from "@/components/forms/fields";

export function ShippingForm({ formRef, disabled }: { formRef: Ref<HTMLFormElement>; disabled: boolean }) {
  return <form ref={formRef} onSubmit={(event) => event.preventDefault()} className="mt-4" aria-label="Delivery details">
    <fieldset disabled={disabled} className="min-w-0 space-y-4">
      <legend className="mb-3 font-display text-base font-semibold">Delivery details</legend>
      <TextField label="Recipient name" name="name" autoComplete="shipping name" required maxLength={100} errors={{}} />
      <TextField label="Mobile number" name="phone" type="tel" inputMode="tel" autoComplete="shipping tel-national" required maxLength={10} hint="10-digit Indian mobile number" errors={{}} />
      <TextField label="House / flat and street" name="addressLine1" autoComplete="shipping address-line1" required maxLength={180} errors={{}} />
      <TextField label="Area / landmark" name="addressLine2" autoComplete="shipping address-line2" required={false} maxLength={180} errors={{}} />
      <div className="grid grid-cols-2 gap-3">
        <TextField label="City" name="city" autoComplete="shipping address-level2" required maxLength={80} errors={{}} />
        <TextField label="State" name="state" autoComplete="shipping address-level1" required maxLength={80} errors={{}} />
      </div>
      <TextField label="PIN code" name="postalCode" inputMode="numeric" autoComplete="shipping postal-code" required maxLength={6} errors={{}} />
      <input type="hidden" name="country" value="IN" />
      <p className="text-xs leading-5 text-muted">India only. These details are saved with your order for order support and delivery. Enter sample details during test checkout. A valid PIN code does not confirm delivery availability; shipping charges and serviceability are not yet calculated.</p>
    </fieldset>
  </form>;
}
