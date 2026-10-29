import type { Metadata } from "next";
import { ClipboardPlus, Save } from "lucide-react";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { adminButtonClass, adminInputClass, adminLabelClass } from "@/components/admin/styles";
import { formatINR } from "@/data/products";
import { listServiceRecords } from "@/lib/admin/db";
import { requireAdmin } from "@/lib/admin/auth";
import { formatAdminDate, titleCaseStatus } from "@/lib/admin/format";
import { serviceStatuses } from "@/lib/admin/types";
import { createServiceAction, updateServiceAction } from "../../actions";

export const metadata: Metadata = { title: "Customer service records", robots: { index: false, follow: false } };

export default async function ServicesPage({ searchParams }: { searchParams: Promise<{ notice?: string; error?: string; ticket?: string }> }) {
  await requireAdmin();
  const [records, query] = await Promise.all([listServiceRecords(), searchParams]);

  return (
    <div className="mx-auto max-w-7xl">
      <div>
        <h1 className="font-display text-2xl font-bold uppercase sm:text-3xl">Service records</h1>
        <p className="mt-2 text-muted">Track every customer device from intake through collection.</p>
      </div>

      {query.notice === "created" && <p role="status" className="mt-6 rounded-xl border border-ok/30 bg-ok/10 px-4 py-3 text-sm text-ok">Service record created. Ticket: <strong>{query.ticket}</strong></p>}
      {query.notice === "updated" && <p role="status" className="mt-6 rounded-xl border border-ok/30 bg-ok/10 px-4 py-3 text-sm text-ok">Service record updated.</p>}
      {query.error && <p role="alert" className="mt-6 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">Check the submitted values and try again.</p>}

      <details className="metal group mt-6 rounded-2xl p-4 sm:p-5">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-bold uppercase">
          <span className="flex items-center gap-3"><ClipboardPlus className="size-5 text-accent-text" aria-hidden />New service record</span>
          <span aria-hidden className="text-2xl text-muted transition-transform group-open:rotate-45">+</span>
        </summary>
        <ConfirmSubmit submitAction={createServiceAction} title="Create service ticket?" confirmLabel="Create ticket" cancelLabel="Keep editing" intent="primary" message="Create this customer service record with the entered device, issue and estimated cost?" className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-2 lg:grid-cols-4">
          <label><span className={adminLabelClass}>Customer name</span><input name="customerName" required maxLength={160} autoComplete="name" className={adminInputClass} /></label>
          <label><span className={adminLabelClass}>Phone</span><input name="phone" required minLength={7} maxLength={24} type="tel" autoComplete="tel" className={adminInputClass} /></label>
          <label><span className={adminLabelClass}>Device</span><input name="device" required placeholder="PS5 Standard" className={adminInputClass} /></label>
          <label><span className={adminLabelClass}>Initial status</span><select name="status" defaultValue="received" className={adminInputClass}>{serviceStatuses.map((status) => <option key={status} value={status}>{titleCaseStatus(status)}</option>)}</select></label>
          <label className="sm:col-span-2"><span className={adminLabelClass}>Reported issue</span><textarea name="issue" required rows={3} maxLength={1000} className={`${adminInputClass} resize-y py-3`} /></label>
          <label><span className={adminLabelClass}>Estimated cost</span><input name="estimatedCost" type="number" min="0" defaultValue="0" required className={adminInputClass} /></label>
          <label><span className={adminLabelClass}>Internal notes</span><textarea name="notes" rows={3} maxLength={4000} className={`${adminInputClass} resize-y py-3`} /></label>
          <div className="flex items-end sm:col-span-2 lg:col-span-4 lg:justify-end"><button type="submit" className={adminButtonClass}>Create service ticket</button></div>
        </ConfirmSubmit>
      </details>

      <section className="mt-8" aria-labelledby="service-list">
        <div className="flex items-center justify-between gap-4">
          <h2 id="service-list" className="font-display text-xl font-bold uppercase">All records</h2>
          <p className="text-sm text-muted">{records.length} {records.length === 1 ? "record" : "records"}</p>
        </div>

        {records.length ? (
          <div className="mt-4 space-y-4">
            {records.map((record) => (
              <article key={record.id} className="metal rounded-2xl p-4">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-accent-text">{record.ticketNumber}</p>
                      <span className="rounded-full border border-line-strong bg-surface px-3 py-1 text-xs font-semibold">{titleCaseStatus(record.status)}</span>
                    </div>
                    <h3 className="mt-3 font-display text-xl font-bold uppercase">{record.customerName}</h3>
                    <p className="text-sm text-muted">{record.phone} · {record.device} · Received {formatAdminDate(record.createdAt)}</p>
                    <p className="mt-4"><span className="text-sm font-semibold text-muted">Issue:</span> {record.issue}</p>
                  </div>
                  <p className="font-display text-2xl font-bold tabular-nums">{formatINR(record.estimatedCost)}</p>
                </div>

                <ConfirmSubmit submitAction={updateServiceAction} title="Update service record?" confirmLabel="Update record" cancelLabel="Keep editing" intent="primary" message={`Save the new status, estimated cost and notes for ${record.ticketNumber} (${record.customerName})?`} className="mt-5 grid gap-3 border-t border-line pt-5 sm:grid-cols-2 xl:grid-cols-[12rem_10rem_minmax(0,1fr)_auto] sm:items-end">
                  <input type="hidden" name="id" value={record.id} />
                  <label><span className={adminLabelClass}>Status</span><select name="status" defaultValue={record.status} className={adminInputClass}>{serviceStatuses.map((status) => <option key={status} value={status}>{titleCaseStatus(status)}</option>)}</select></label>
                  <label><span className={adminLabelClass}>Estimated cost</span><input name="estimatedCost" type="number" min="0" defaultValue={record.estimatedCost} required className={adminInputClass} /></label>
                  <label><span className={adminLabelClass}>Internal notes</span><input name="notes" maxLength={4000} defaultValue={record.notes} className={adminInputClass} /></label>
                  <button type="submit" className={adminButtonClass}><Save className="mr-2 size-4" aria-hidden />Update</button>
                </ConfirmSubmit>
              </article>
            ))}
          </div>
        ) : <p className="mt-4 rounded-2xl border border-dashed border-line-strong p-10 text-center text-muted">No service records yet.</p>}
      </section>
    </div>
  );
}
