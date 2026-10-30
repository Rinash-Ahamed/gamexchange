"use client";

import { useId, useState } from "react";
import type { InventoryItem } from "@/lib/admin/types";
import { formatINR } from "@/data/products";
import { discountedPrice, productDiscount } from "@/lib/pricing";
import { adminInputClass, adminLabelClass } from "./styles";

export function InventoryPricingFields({ item }: { item?: InventoryItem }) {
  const discount = item ? productDiscount(item) : null;
  const [base, setBase] = useState(item ? String(discount?.original ?? item.price) : "");
  const [percent, setPercent] = useState(discount ? String(discount.percent) : "0");
  const id = useId();
  const amount = Number(base);
  const rate = Number(percent);
  const valid = base.trim() !== "" && Number.isInteger(amount) && amount >= 0 && amount <= 10_000_000 && Number.isFinite(rate) && rate >= 0 && rate <= 100;
  const price = valid ? discountedPrice(amount, rate) : 0;
  const tooSmall = valid && rate > 0 && price >= amount;
  return <fieldset className="col-span-full rounded-xl border border-line-strong bg-surface/50 p-3">
    <legend className="px-1 font-display text-xs font-semibold uppercase tracking-wide">Pricing and discount</legend>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <label htmlFor={`${id}-base`}><span className={adminLabelClass}>Price before discount (INR)</span><input id={`${id}-base`} name="basePrice" type="number" min="0" max="10000000" step="1" required value={base} onChange={(event) => setBase(event.target.value)} className={adminInputClass} /></label>
      <label htmlFor={`${id}-discount`}><span className={adminLabelClass}>Discount (%)</span><input id={`${id}-discount`} name="discountPercent" type="number" min="0" max="100" step="any" value={percent} onChange={(event) => setPercent(event.target.value)} aria-describedby={`${id}-note`} className={adminInputClass} /></label>
      <div><span className={adminLabelClass}>Final selling price</span><output htmlFor={`${id}-base ${id}-discount`} aria-live="polite" className="admin-control flex items-center rounded-lg border border-blue/30 bg-fill/10 px-3 font-display text-base font-bold text-accent-text">{valid ? formatINR(price) : "Enter a price"}</output></div>
    </div>
    <p id={`${id}-note`} className="mt-2 text-xs leading-5 text-muted">Set 0% for no discount. Final price is rounded to the nearest rupee.{valid && price < amount ? ` Customer saves ${formatINR(amount - price)}.` : ""}</p>
    {tooSmall && <p role="alert" className="mt-2 text-xs text-danger">Increase the discount so the final price is at least one rupee lower.</p>}
  </fieldset>;
}
