"use client";

import { AlertTriangle, Check, Trash2, X } from "lucide-react";
import { useEffect, useId, useRef, useState, useTransition, type FormEvent, type MouseEvent, type ReactNode, type RefObject } from "react";
import { useRouter } from "next/navigation";
import { AdminPendingContext, useAdminFormPending } from "./admin-form-status";
import { AdminNotice } from "./AdminNotice";
import type { AdminSaveResult } from "@/lib/admin/save-result";
import { adminButtonClass, adminGhostButtonClass } from "./styles";

type ConfirmSubmitProps = {
  children: ReactNode;
  message: string;
  submitAction: (formData: FormData) => void | AdminSaveResult | Promise<void | AdminSaveResult>;
  /** Retain native fields/files when a save returns an error. */
  preserveOnError?: boolean;
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  intent?: "danger" | "primary";
  /** Layout and spacing for the controls, applied to their actual fieldset parent. */
  className?: string;
  formRef?: RefObject<HTMLFormElement | null>;
};

function PendingFields({ children, className = "" }: { children: ReactNode; className?: string }) {
  const pending = useAdminFormPending();
  return <fieldset disabled={pending} className={`min-w-0 ${className}`}>{children}{pending && <p role="status" className="col-span-full text-sm text-muted">Please wait...</p>}</fieldset>;
}

export function ConfirmSubmit({ children, message, submitAction, preserveOnError = false, title = "Delete this item?", confirmLabel = "Delete permanently", cancelLabel = "Keep item", intent = "danger", className, formRef }: ConfirmSubmitProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [failure, setFailure] = useState<{ message: string } | null>(null);
  const saving = useRef(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const ownForm = useRef<HTMLFormElement>(null);
  const form = formRef ?? ownForm;
  const confirmed = useRef(false);
  const previousOverflow = useRef("");
  const scrollLocked = useRef(false);
  const submitter = useRef<HTMLButtonElement | HTMLInputElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  const restoreScroll = () => {
    if (!scrollLocked.current) return;
    document.body.style.overflow = previousOverflow.current;
    scrollLocked.current = false;
  };

  const closeDialog = () => {
    dialog.current?.close();
    restoreScroll();
  };

  const openDialog = () => {
    if (!dialog.current || dialog.current.open) return;
    previousOverflow.current = document.body.style.overflow;
    scrollLocked.current = true;
    document.body.style.overflow = "hidden";
    dialog.current.showModal();
  };

  const interceptSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (saving.current) { event.preventDefault(); return; }
    if (confirmed.current) {
      confirmed.current = false;
      if (preserveOnError) {
        event.preventDefault();
        // Capture before pending disables fields. Explicit invocation avoids
        // React's uncontrolled-input reset after an action returns an error.
        const data = new FormData(event.currentTarget);
        saving.current = true;
        setFailure(null);
        startTransition(async () => {
          try {
            const result = await submitAction(data);
            if (result && result.error) setFailure({ message: result.error });
            else if (result && result.redirectTo) router.push(result.redirectTo);
            else setFailure({ message: "Could not confirm the save. Your entries are still here. Check inventory before retrying." });
          } catch {
            setFailure({ message: "Could not confirm the save. Your entries are still here. Check inventory before retrying." });
          } finally { saving.current = false; }
        });
      }
      return;
    }
    event.preventDefault();
    const target = (event.nativeEvent as SubmitEvent).submitter;
    submitter.current = target instanceof HTMLButtonElement || target instanceof HTMLInputElement ? target : null;
    openDialog();
  };

  const confirmAction = () => {
    confirmed.current = true;
    closeDialog();
    form.current?.requestSubmit(submitter.current?.isConnected ? submitter.current : undefined);
    confirmed.current = false;
  };

  const dismissFromBackdrop = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) closeDialog();
  };

  useEffect(() => {
    return () => {
      if (scrollLocked.current) document.body.style.overflow = previousOverflow.current;
    };
  }, []);

  return (
    <AdminPendingContext.Provider value={pending}>
    <form ref={form} action={submitAction as (data: FormData) => void | Promise<void>} onSubmit={interceptSubmit} className="min-w-0" aria-busy={pending || undefined}>
      {failure && <AdminNotice variant="error" clearQuery={false} eventKey={failure}>{failure.message}</AdminNotice>}
      <PendingFields className={className}>{children}</PendingFields>

      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="admin-confirm-dialog"
        data-intent={intent}
        onCancel={restoreScroll}
        onClose={restoreScroll}
        onClick={dismissFromBackdrop}
      >
        <div className="admin-confirm-panel">
          <div className="flex items-start justify-between gap-5">
            <div className={`grid size-10 shrink-0 place-items-center rounded-xl border ${intent === "danger" ? "border-danger/30 bg-danger/10 text-danger" : "border-blue/30 bg-blue/10 text-accent-text"}`}>
              {intent === "danger" ? <AlertTriangle className="size-5" aria-hidden /> : <Check className="size-5" aria-hidden />}
            </div>
            <button
              type="button"
              onClick={closeDialog}
              aria-label="Close confirmation"
              className="grid size-10 shrink-0 place-items-center rounded-full border border-line bg-surface text-muted transition-colors hover:border-line-strong hover:text-ink"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>

          <h2 id={titleId} className="mt-4 font-display text-xl font-bold uppercase">
            {title}
          </h2>
          <p id={descriptionId} className="mt-2 text-sm leading-6 text-muted">
            {message}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button type="button" autoFocus onClick={closeDialog} className={adminGhostButtonClass}>
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={confirmAction}
              className={intent === "danger" ? "admin-control inline-flex items-center justify-center rounded-lg bg-danger px-3 font-display text-xs font-semibold uppercase tracking-[0.08em] text-danger-ink transition-[filter,transform] hover:brightness-110 active:scale-[0.98]" : adminButtonClass}
            >
              {intent === "danger" && <Trash2 className="mr-2 size-4" aria-hidden />}
              {confirmLabel}
            </button>
          </div>
        </div>
      </dialog>
    </form>
    </AdminPendingContext.Provider>
  );
}
