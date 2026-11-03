import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { listAuditEntries } from "@/lib/admin/audit";
import { formatAdminDate } from "@/lib/admin/format";

export const metadata: Metadata = { title: "Admin activity", robots: { index: false, follow: false } };
export default async function ActivityPage() {
  await requireAdmin();
  const entries = await listAuditEntries();
  return <div className="mx-auto max-w-6xl">
    <h1 className="font-display text-2xl font-bold uppercase">Activity</h1>
    <p className="mt-2 text-sm text-muted">Latest 50 inventory, category and service-record changes. History starts when this update is deployed. Customer details and notes are not copied here.</p>
    <ol className="mt-6 space-y-3">{entries.map((entry) => <li key={entry.id} className="metal min-w-0 rounded-xl p-4 text-sm">
      <p className="font-semibold">{entry.resource} · {entry.action}</p>
      <p className="mt-1 break-all text-xs text-muted">{formatAdminDate(entry.createdAt)} · Admin UID: {entry.actorUid} · Record: {entry.resourceId}</p>
      <p className="mt-2 break-words">Changed: {entry.changedFields.join(", ") || "No field changes"}</p>
      {(Object.keys(entry.before).length > 0 || Object.keys(entry.after).length > 0) && <details className="mt-2"><summary className="cursor-pointer text-accent-text">View recorded values</summary><div className="mt-2 grid min-w-0 gap-3 sm:grid-cols-2"><div><p className="text-xs text-muted">Before</p><pre className="whitespace-pre-wrap break-all text-xs">{JSON.stringify(entry.before, null, 2)}</pre></div><div><p className="text-xs text-muted">After</p><pre className="whitespace-pre-wrap break-all text-xs">{JSON.stringify(entry.after, null, 2)}</pre></div></div></details>}
    </li>)}</ol>
    {!entries.length && <p className="mt-6 text-sm text-muted">No recorded changes yet.</p>}
  </div>;
}
