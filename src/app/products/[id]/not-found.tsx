import Link from "next/link";

export default function ProductNotFound() {
  return <main className="mx-auto min-h-[60dvh] max-w-xl px-5 py-32 sm:px-8"><h1 className="font-display text-3xl font-bold">This gear is unavailable.</h1><p className="mt-3 text-sm leading-6 text-muted">The item is no longer listed, or the link has changed. Browse the shop for currently available stock.</p><Link href="/products" className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-fill px-5 font-display text-sm font-semibold text-accent-ink">Back to the shop</Link></main>;
}
