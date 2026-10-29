import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { LegalContact } from "@/components/legal/LegalDocument";
import { PageHero } from "@/components/ui/PageHero";
import { businessDetails, policies, terms } from "@/data/legal";

export const metadata: Metadata = { title: "Policies and support", description: "GamexChange business details, purchase terms, returns, shipping, trade-in, store credit and warranty policies.", alternates: { canonical: "/policies" } };

export default function PoliciesPage() {
  return (
    <main>
      <PageHero title={<>Policies and<br /><span className="text-gradient">support.</span></>}>Our policies, business details and support information, all in one place.</PageHero>
      <div className="mx-auto max-w-7xl px-5 pb-14 sm:px-8 sm:pb-16">
        <section aria-labelledby="policy-directory-heading">
          <h2 id="policy-directory-heading" className="sr-only">Terms and policies</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[terms, ...policies].map((policy) => <Link key={policy.slug} href={policy.slug === "terms" ? "/terms" : `/policies/${policy.slug}`} className="metal group rounded-2xl p-5 transition-colors hover:border-blue focus-visible:border-blue">
              <div className="flex items-start justify-between gap-3"><h3 className="font-display text-xl font-bold">{policy.title}</h3><ArrowUpRight className="size-5 shrink-0 text-accent-text" aria-hidden /></div>
              <p className="mt-3 text-sm leading-relaxed text-muted">{policy.description}</p>
            </Link>)}
          </div>
        </section>
        <section aria-labelledby="business-details-heading" className="mt-10 grid gap-6 border-t border-line pt-7 lg:grid-cols-2">
          <div><h2 id="business-details-heading" className="font-display text-2xl font-bold">About GamexChange</h2><div className="mt-3 space-y-3 text-sm leading-7 text-muted">{businessDetails.about.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></div>
          <div className="rounded-2xl border border-line-strong bg-surface p-5"><h3 className="mb-3 font-display text-lg font-bold">Business and support details</h3><LegalContact /></div>
        </section>
      </div>
    </main>
  );
}
