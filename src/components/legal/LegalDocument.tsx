import Link from "next/link";
import { businessDetails, type LegalPolicy } from "@/data/legal";

export function LegalContact() {
  return (
    <address className="space-y-2 text-sm not-italic leading-relaxed text-muted">
      <p className="font-semibold text-ink">{businessDetails.brand} · {businessDetails.entity}</p>
      <p>{businessDetails.address}</p>
      <p>CIN: {businessDetails.cin}</p>
      <p className="flex flex-wrap gap-x-5 gap-y-1">
        <a href={`mailto:${businessDetails.email}`} className="break-all text-accent-text underline underline-offset-4">{businessDetails.email}</a>
        <a href={`tel:${businessDetails.phone}`} className="text-accent-text underline underline-offset-4">{businessDetails.phoneDisplay}</a>
      </p>
    </address>
  );
}

/** Static, theme-aware legal layout; all policy text is visible without JavaScript. */
export function LegalDocument({ policy, draft = false }: { policy: LegalPolicy; draft?: boolean }) {
  return (
    <div className="mx-auto max-w-7xl px-5 pb-14 sm:px-8 sm:pb-16">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4 text-sm">
        <p className="text-muted">{draft ? "Draft prepared" : "Last updated"}: {policy.updated}</p>
        <Link href="/policies" className="text-accent-text hover:underline">All policies</Link>
      </div>
      <div className="grid items-start gap-7 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
        <nav aria-label={`${policy.title} sections`} className="metal rounded-2xl p-4 lg:sticky lg:top-24 lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto">
          <h2 className="font-display text-base font-semibold uppercase">On this page</h2>
          <ol className="mt-3 grid gap-x-4 sm:grid-cols-2 lg:grid-cols-1">
            {policy.sections.map((section) => <li key={section.id}><a href={`#${section.id}`} className="block break-words py-2 text-sm leading-relaxed text-muted transition-colors hover:text-accent-text">{section.title}</a></li>)}
          </ol>
        </nav>
        <article className="min-w-0 max-w-3xl space-y-8">
          {policy.sections.map((section) => (
            <section key={section.id} id={section.id} aria-labelledby={`${section.id}-heading`} className="scroll-mt-28 border-b border-line pb-7">
              <h2 id={`${section.id}-heading`} className="font-display text-xl font-bold text-ink sm:text-2xl">{section.title}</h2>
              <div className="mt-3 space-y-3 break-words text-base leading-7 text-muted">{section.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
            </section>
          ))}
          <section aria-labelledby="legal-support-heading" className="rounded-2xl border border-line-strong bg-surface p-5 sm:p-6">
            <h2 id="legal-support-heading" className="mb-3 font-display text-xl font-bold">Need help?</h2><LegalContact />
          </section>
        </article>
      </div>
    </div>
  );
}
