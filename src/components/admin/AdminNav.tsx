"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, House, Images, LayoutDashboard, MessageCircleQuestion, Tags, Wrench, ShoppingCart } from "lucide-react";
import { adminNavLinkClass } from "./styles";

const items = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/orders", label: "Test orders", icon: ShoppingCart },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/services", label: "Service records", icon: Wrench },
] as const;

const homepageItems = [
  { href: "/admin/banners", label: "Banners", icon: Images },
  { href: "/admin/faqs", label: "FAQs", icon: MessageCircleQuestion },
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
            className={adminNavLinkClass(active)}
          >
            <Icon className="size-4" aria-hidden />
            {item.label}
          </Link>
        );
      })}
      <section aria-label="Homepage management" className="mt-2 border-t border-line pt-3 sm:col-span-2 lg:col-span-1">
        <h2 className="flex items-center gap-2.5 px-3 font-display text-xs font-semibold uppercase tracking-[0.08em] text-muted"><House className="size-4" aria-hidden />Homepage</h2>
        <ul className="ml-5 mt-2 space-y-1 border-l border-line pl-2">
          {homepageItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return <li key={item.href}><Link href={item.href} aria-current={active ? "page" : undefined} className={adminNavLinkClass(active)}><Icon className="size-4" aria-hidden />{item.label}</Link></li>;
          })}
        </ul>
      </section>
    </nav>
  );
}
