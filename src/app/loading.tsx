/** A reusable route shell lets navigation respond while server data streams. */
export default function Loading() {
  return <main aria-busy="true" aria-label="Loading page" className="mx-auto min-h-[70dvh] max-w-7xl px-5 pb-12 pt-28 sm:px-8 sm:pt-32">
    <p role="status" className="font-display text-sm font-semibold text-accent-text">Loading GamexChange…</p>
    <div aria-hidden className="mt-6 space-y-6">
      <div className="h-12 w-2/3 max-w-lg rounded-xl bg-surface-2" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[0, 1, 2, 3].map((item) => <div key={item} className="h-64 rounded-2xl border border-line bg-surface" />)}</div>
    </div>
  </main>;
}
