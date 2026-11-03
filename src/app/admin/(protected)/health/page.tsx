import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { adminReadiness } from "@/lib/admin/readiness";
import { adminGhostButtonClass } from "@/components/admin/styles";

export const metadata: Metadata = { title: "System health", robots: { index: false, follow: false } };
export default async function HealthPage() {
  await requireAdmin();
  const result = await adminReadiness();
  return <div className="mx-auto max-w-4xl">
    <h1 className="font-display text-2xl font-bold uppercase">System health</h1>
    <p role="status" className={`mt-4 text-sm ${result.ready ? "text-ok" : "text-danger"}`}>{result.ready ? "Read-only dependency checks passed." : "A dependency is unavailable. Check server configuration and provider status."}</p>
    <dl className="metal mt-5 divide-y divide-line rounded-xl px-4">{Object.entries(result.checks).map(([name, status]) => <div key={name} className="flex justify-between gap-4 py-3 text-sm"><dt className="capitalize">{name}</dt><dd>{status}</dd></div>)}</dl>
    <p className="mt-4 text-xs text-muted">Checks database read access, bucket listing and signing configuration. No records are written. This does not verify uploads, TTL cleanup, distributed contention, backups, MFA recovery or Razorpay payments.</p>
    <Link href="/api/admin/readiness" prefetch={false} className={`${adminGhostButtonClass} mt-4`}>View fresh JSON check</Link>
  </div>;
}
