import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { adminReadiness } from "@/lib/admin/readiness";

export const metadata: Metadata = { title: "System health", robots: { index: false, follow: false } };
export default async function HealthPage() {
  await requireAdmin();
  const result = await adminReadiness();
  const labels = { firestore: "Saved data", storage: "Image storage", signing: "Request protection" };
  return <div className="mx-auto max-w-4xl">
    <h1 className="font-display text-2xl font-bold uppercase">System health</h1>
    <p role="status" className={`mt-4 text-sm ${result.ready ? "text-ok" : "text-danger"}`}>{result.ready ? "Basic services are available." : "A service is unavailable. Please contact support if the problem continues."}</p>
    <dl className="metal mt-5 divide-y divide-line rounded-xl px-4">{Object.entries(result.checks).map(([name, status]) => <div key={name} className="flex justify-between gap-4 py-3 text-sm"><dt>{labels[name as keyof typeof labels]}</dt><dd>{status === "ok" ? "Available" : "Needs attention"}</dd></div>)}</dl>
    <p className="mt-4 text-xs text-muted">Connection checks only. These do not confirm that uploads or payments will complete.</p>
  </div>;
}
