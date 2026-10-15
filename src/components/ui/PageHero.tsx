import type { ReactNode } from "react";

export function PageHero({ title, children }: { title: ReactNode; children?: ReactNode }) {
  return (
    <header className="relative isolate overflow-clip px-5 pb-10 pt-28 sm:px-8 sm:pt-32">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 size-[60vmax] -translate-x-1/2 -translate-y-1/3 rounded-full bg-[radial-gradient(closest-side,var(--hero-wash-a),transparent)]" />
        <div className="absolute inset-0" style={{ background: "var(--hero-vignette)" }} />
      </div>
      <div className="mx-auto max-w-7xl">
        <h1 className="anim-rise font-display text-[clamp(2.8rem,8vw,6.5rem)] font-bold uppercase leading-[0.9] tracking-tight" style={{ ["--d" as string]: "0.1s" }}>{title}</h1>
        {children && <p className="anim-rise mt-4 max-w-2xl text-lg leading-relaxed text-muted" style={{ ["--d" as string]: "0.25s" }}>{children}</p>}
      </div>
    </header>
  );
}
