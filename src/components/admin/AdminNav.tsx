"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, Images, LayoutDashboard, Wrench } from "lucide-react";

const items = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/services", label: "Service records", icon: Wrench },
  { href: "/admin/banners", label: "Homepage banners", icon: Images },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
      {items.map((item) => {
        const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-11 items-center gap-3 rounded-xl px-3.5 font-display text-xs font-semibold uppercase tracking-[0.12em] transition-colors ${active ? "bg-gradient-to-r from-fill to-fill-2 text-accent-ink" : "text-muted hover:bg-surface-2 hover:text-ink"}`}
          >
            <Icon className="size-4" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
