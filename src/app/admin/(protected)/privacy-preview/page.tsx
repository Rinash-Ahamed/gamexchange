import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { privacyPolicyDraft } from "@/data/privacy-policy-draft";

export const metadata: Metadata = { title: "Privacy policy draft preview", robots: { index: false, follow: false } };

export default async function PrivacyPreviewPage() {
  await requireAdmin();
  return (
    <div>
      <header className="mx-auto max-w-7xl px-5 pb-6 sm:px-8">
        <h1 className="font-display text-2xl font-bold uppercase sm:text-3xl">Privacy policy <span className="text-gradient">preview</span></h1>
        <p className="mt-3 rounded-xl border border-blue/30 bg-blue/10 p-4 text-sm leading-relaxed text-ink">Draft for your review, not published. Confirm the privacy contact, hosting and data regions, retention periods, third-party services and children's data process before approval. No legal compliance review has been completed.</p>
      </header>
      <LegalDocument policy={privacyPolicyDraft} draft />
    </div>
  );
}
