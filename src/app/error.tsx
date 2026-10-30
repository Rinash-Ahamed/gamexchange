"use client";

import Link from "next/link";

/** Recoverable fallback without exposing server errors or customer data. */
export default function PageError({ reset }: { reset: () => void }) {
  return <main className="mx-auto flex min-h-[60dvh] max-w-xl flex-col justify-center px-5 py-24 sm:px-8">
    <h1 className="font-display text-3xl font-bold">Something could not load.</h1>
    <p role="alert" className="mt-3 text-sm leading-6 text-muted">Please try again. If the problem continues, contact the GamexChange team.</p>
    <div className="mt-6 flex flex-wrap gap-3">
      <button type="button" onClick={reset} className="min-h-11 rounded-xl bg-fill px-5 font-display text-sm font-semibold text-accent-ink">Try again</button>
      <Link href="/" className="inline-flex min-h-11 items-center rounded-xl border border-line-strong px-5 font-display text-sm font-semibold">Back to home</Link>
    </div>
  </main>;
}
