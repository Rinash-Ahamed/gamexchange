import type { ReactNode } from "react";

export function SectionHeading({ eyebrow, title, children, align = "left" }: { eyebrow: string; title: ReactNode; children?: ReactNode; align?: "left" | "center" }) {
  return (
    <div className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-4 font-display text-[clamp(2.4rem,7vw,4.4rem)] font-bold uppercase leading-[0.92] tracking-tight">{title}</h2>
      {children && <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">{children}</p>}
    </div>
  );
}
