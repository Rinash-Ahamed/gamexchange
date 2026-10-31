import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { FaqFields } from "@/components/admin/FaqFields";
import { adminButtonClass, adminGhostButtonClass } from "@/components/admin/styles";
import { requireAdmin } from "@/lib/admin/auth";
import { listAdminFaqs } from "@/lib/admin/faqs";
import { deleteFaqAction, saveFaqAction } from "../../faq-actions";
import { AdminNotice } from "@/components/admin/AdminNotice";

export const metadata: Metadata = { title: "Homepage FAQs", robots: { index: false, follow: false } };

const errors: Record<string, string> = {
  invalid: "Use a question of 3 to 200 characters, an answer of 3 to 6000 characters and a display order from 1 to 999.",
  missing: "This FAQ no longer exists. Refresh and try again.", limit: "You can save up to 30 FAQs. Remove an unused one first.",
  duplicate: "That question already exists. Edit the existing FAQ instead.",
};

export default async function FaqsPage({ searchParams }: { searchParams: Promise<{ notice?: string; error?: string; saved?: string }> }) {
  await requireAdmin();
  const [faqs, query] = await Promise.all([listAdminFaqs(), searchParams]);
  const published = faqs.filter((faq) => faq.status === "published").length;
  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="font-display text-2xl font-bold uppercase sm:text-3xl">Homepage FAQs</h1><p className="mt-2 text-sm text-muted">Manage the questions and answers in Quick answers.</p></div><Link href="/#faq-h" target="_blank" rel="noopener noreferrer" className={adminGhostButtonClass}>View on website</Link></div>
{query.notice && <AdminNotice key={`${query.notice}-${query.saved}`} className="mt-5">{query.notice === "deleted" ? "FAQ deleted." : "FAQ saved. Published changes appear on the next homepage visit or refresh."}</AdminNotice>}
      {query.error && errors[query.error] && <p role="alert" className="mt-5 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{errors[query.error]}</p>}
      <details key={query.saved ?? "new"} className="metal mt-6 rounded-xl p-4">
        <summary className="cursor-pointer font-display text-base font-bold uppercase">Add FAQ</summary>
        <ConfirmSubmit submitAction={saveFaqAction} title="Save FAQ?" message="Save this question and answer? Published FAQs appear on the homepage; drafts stay private." confirmLabel="Save FAQ" cancelLabel="Keep editing" intent="primary" className="mt-4 grid gap-3 sm:grid-cols-2">
          <FaqFields nextPosition={Math.min(999, Math.max(0, ...faqs.map((faq) => faq.position)) + 1)} />
          <div className="sm:col-span-2"><button type="submit" disabled={faqs.length >= 30} className={`${adminButtonClass} disabled:cursor-not-allowed disabled:opacity-50`}>Save FAQ</button></div>
        </ConfirmSubmit>
      </details>
      <div className="mt-7 flex flex-wrap items-center justify-between gap-3"><h2 className="font-display text-lg font-bold uppercase">Saved FAQs</h2><p className="text-xs text-muted">{published} published · {faqs.length} / 30 saved</p></div>
      <ul className="metal mt-3 divide-y divide-line overflow-hidden rounded-xl">
        {faqs.map((faq) => <li key={`${faq.id}:${query.saved ?? ""}`} className="p-4">
          <div className="flex flex-wrap items-start justify-between gap-3"><h3 className="min-w-0 flex-1 basis-56 break-words text-sm font-semibold">{faq.q}</h3><span className="text-xs text-muted">{faq.status === "published" ? "Published" : "Draft"} · Order {faq.position}</span></div>
          <p className="mt-2 line-clamp-2 whitespace-pre-line break-words text-sm leading-relaxed text-muted">{faq.a}</p>
          <div className="mt-3 flex justify-end"><ConfirmSubmit submitAction={deleteFaqAction} title="Delete FAQ?" message={`Delete “${faq.q}” from the website and admin? This cannot be undone.`}><input type="hidden" name="id" value={faq.id} /><button type="submit" aria-label={`Delete ${faq.q}`} className={`${adminGhostButtonClass} gap-2 text-danger`}><Trash2 className="size-4" aria-hidden />Delete</button></ConfirmSubmit></div>
          <details name="faq-edit" className="mt-3"><summary className={`${adminGhostButtonClass} w-fit cursor-pointer list-none gap-2`}><Pencil className="size-4" aria-hidden />Edit FAQ</summary>
            <ConfirmSubmit submitAction={saveFaqAction} title="Save FAQ changes?" message="Update the question, answer, display order and visibility? Published changes will update the homepage." confirmLabel="Save changes" cancelLabel="Keep editing" intent="primary" className="mt-3 grid gap-3 border-t border-line pt-3 sm:grid-cols-2"><FaqFields faq={faq} /><div className="sm:col-span-2"><button type="submit" className={adminButtonClass}>Save changes</button></div></ConfirmSubmit>
          </details>
        </li>)}
      </ul>
      {!faqs.length && <p className="mt-4 text-sm text-muted">No FAQs saved. Add one above. The homepage section stays hidden until a question is published.</p>}
    </div>
  );
}
