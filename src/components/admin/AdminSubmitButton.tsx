"use client";

import { useAdminFormPending } from "./admin-form-status";
import { LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";
import { adminButtonClass } from "./styles";

/** Must be rendered inside the form whose server action it tracks. */
export function AdminSubmitButton({ children, pendingLabel = "Saving..." }: { children: ReactNode; pendingLabel?: string }) {
  const pending = useAdminFormPending();
  return <button type="submit" disabled={pending} aria-busy={pending} className={`${adminButtonClass} disabled:cursor-wait disabled:opacity-70`}>
    {pending && <LoaderCircle className="mr-2 size-4 animate-spin motion-reduce:animate-none" aria-hidden />}
    <span aria-live="polite" className="inline-flex items-center">{pending ? pendingLabel : children}</span>
  </button>;
}
