import type { Metadata } from "next";
import Link from "next/link";
import { Boxes, CircleAlert, PackageCheck, Wrench, BadgeCheck } from "lucide-react";
import { dashboardStats, listServiceRecords } from "@/lib/admin/db";
import { formatAdminDate, titleCaseStatus } from "@/lib/admin/format";

export const metadata: Metadata = { title: "Admin dashboard", robots: { index: false, follow: false } };

export default async function AdminDashboardPage() {
  const [stats, recent] = await Promise.all([dashboardStats(), listServiceRecords(5)]);
  const cards = [
    { label: "Inventory items", value: stats.inventoryItems, icon: Boxes, tone: "text-accent-text" },
    { label: "Units in stock", value: stats.unitsInStock, icon: PackageCheck, tone: "text-ok" },
    { label: "Low stock", value: stats.lowStockItems, icon: CircleAlert, tone: "text-danger" },
    { label: "Open services", value: stats.openServices, icon: Wrench, tone: "text-violet" },
    { label: "Ready for pickup", value: stats.readyServices, icon: BadgeCheck, tone: "text-ok" },
  ] as const;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase sm:text-3xl">Operations dashboard</h1>
          <p className="mt-2 text-muted">Inventory and repair activity at a glance.</p>
        </div>
        <p className="rounded-full border border-line bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-ok">Live Data</p>
      </div>

      <section aria-label="Summary" className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.label} className="metal rounded-2xl p-5">
              <Icon className={`size-5 ${card.tone}`} aria-hidden />
              <p className="mt-5 font-display text-4xl font-bold tabular-nums">{card.value}</p>
              <p className="mt-1 text-sm text-muted">{card.label}</p>
            </article>
          );
        })}
      </section>

      <section className="metal mt-8 rounded-3xl p-5 sm:p-6" aria-labelledby="recent-services">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 id="recent-services" className="font-display text-xl font-bold uppercase">Recent service records</h2>
            <p className="mt-1 text-sm text-muted">The latest customer devices received by the shop.</p>
          </div>
          <Link href="/admin/services" className="text-sm font-semibold text-accent-text hover:underline">View all</Link>
        </div>
        {recent.length ? (
          <ul className="mt-5 divide-y divide-line">
            {recent.map((record) => (
              <li key={record.id} className="grid gap-2 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="font-semibold">{record.customerName} <span className="font-normal text-muted">{record.device}</span></p>
                  <p className="mt-1 text-xs text-muted">{record.ticketNumber} · {formatAdminDate(record.createdAt)}</p>
                </div>
                <span className="w-fit rounded-full border border-line-strong bg-surface px-3 py-1 text-xs font-semibold text-accent-text">{titleCaseStatus(record.status)}</span>
              </li>
            ))}
          </ul>
        ) : <p className="mt-6 rounded-2xl border border-dashed border-line-strong p-8 text-center text-sm text-muted">No service records yet.</p>}
      </section>
    </div>
  );
}
