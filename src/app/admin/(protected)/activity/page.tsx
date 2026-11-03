import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { listAuditEntries, type AuditEntry } from "@/lib/admin/audit";
import { adminFieldLabel, formatAdminDate } from "@/lib/admin/format";

function RecordedValues({ values }: { values: AuditEntry["before"] }) {
  if (!Object.keys(values).length) return <p className="mt-2 text-xs text-muted">No saved values.</p>;
  return <dl className="mt-2 space-y-2 text-xs">{Object.entries(values).map(([field, value]) => <div key={field} className="flex flex-wrap justify-between gap-2"><dt className="text-muted">{adminFieldLabel(field)}</dt><dd className="min-w-0 break-all">{value === null || value === "" ? "Not set" : typeof value === "boolean" ? value ? "Yes" : "No" : String(value)}</dd></div>)}</dl>;
}

export const metadata: Metadata = { title: "Admin activity", robots: { index: false, follow: false } };
export default async function ActivityPage() {
  await requireAdmin();
  const entries = await listAuditEntries();
  return <div className="mx-auto max-w-6xl">
    <h1 className="font-display text-2xl font-bold uppercase">Activity</h1>
    <p className="mt-2 text-sm text-muted">Recent changes to inventory, categories and service records.</p>
    <ol className="mt-6 space-y-3">{entries.map((entry) => <li key={entry.id} className="metal min-w-0 rounded-xl p-4 text-sm">
      <p className="font-semibold">{adminFieldLabel(entry.resource)} · {adminFieldLabel(entry.action)}</p>
      <p className="mt-1 text-xs text-muted">{formatAdminDate(entry.createdAt)}</p>
      <p className="mt-2 break-words">Changed: {entry.changedFields.map(adminFieldLabel).join(", ") || "No field changes"}</p>
      <details className="mt-2"><summary className="cursor-pointer text-accent-text">Change details</summary><p className="mt-2 break-all text-xs text-muted">Administrator reference: {entry.actorUid}<br />Record reference: {entry.resourceId}</p><div className="mt-3 grid min-w-0 gap-4 sm:grid-cols-2"><div><h2 className="text-xs font-semibold">Before</h2><RecordedValues values={entry.before} /></div><div><h2 className="text-xs font-semibold">After</h2><RecordedValues values={entry.after} /></div></div></details>
    </li>)}</ol>
    {!entries.length && <p className="mt-6 text-sm text-muted">No recorded changes yet.</p>}
  </div>;
}
