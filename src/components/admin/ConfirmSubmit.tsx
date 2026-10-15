"use client";

import { AlertTriangle, Trash2, X } from "lucide-react";
import { useEffect, useId, useRef, type FormEvent, type MouseEvent } from "react";
import { adminGhostButtonClass } from "./styles";

type ConfirmSubmitProps = {
  children: React.ReactNode;
  message: string;
  submitAction: (formData: FormData) => void | Promise<void>;
};

export function ConfirmSubmit({ children, message, submitAction }: ConfirmSubmitProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const confirmed = useRef(false);
  const previousOverflow = useRef("");
  const titleId = useId();
  const descriptionId = useId();

  const restoreScroll = () => {
    document.body.style.overflow = previousOverflow.current;
  };

  const closeDialog = () => {
    dialog.current?.close();
    restoreScroll();
  };

  const openDialog = () => {
    if (!dialog.current || dialog.current.open) return;
    previousOverflow.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current.showModal();
  };

  const interceptSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (confirmed.current) {
      confirmed.current = false;
      return;
    }
    event.preventDefault();
    openDialog();
  };

  const confirmDelete = () => {
    confirmed.current = true;
    closeDialog();
    form.current?.requestSubmit();
  };

  const dismissFromBackdrop = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) closeDialog();
  };

  useEffect(() => {
    return () => {
      document.body.style.overflow = previousOverflow.current;
    };
  }, []);

  return (
    <form ref={form} action={submitAction} onSubmit={interceptSubmit}>
      {children}

      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="admin-confirm-dialog"
        onCancel={restoreScroll}
        onClose={restoreScroll}
        onClick={dismissFromBackdrop}
      >
        <div className="admin-confirm-panel">
          <div className="flex items-start justify-between gap-5">
            <div className="grid size-12 shrink-0 place-items-center rounded-2xl border border-danger/30 bg-danger/10 text-danger">
              <AlertTriangle className="size-6" aria-hidden />
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

          <h2 id={titleId} className="mt-5 font-display text-2xl font-bold uppercase">
            Delete this item?
          </h2>
          <p id={descriptionId} className="mt-2 text-sm leading-6 text-muted">
            {message}
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={closeDialog} className={adminGhostButtonClass}>
              Keep item
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-danger px-4 font-display text-xs font-semibold uppercase tracking-[0.14em] text-danger-ink transition-[filter,transform] hover:brightness-110 active:scale-[0.98]"
            >
              <Trash2 className="mr-2 size-4" aria-hidden />
              Delete permanently
            </button>
          </div>
        </div>
      </dialog>
    </form>
  );
}
