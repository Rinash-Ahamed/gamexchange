"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { m, useMotionValueEvent, useScroll } from "motion/react";
import { House, ShoppingBag, Repeat, Wrench, Gamepad2, Phone, type LucideIcon } from "lucide-react";
import { navItems, whatsappUrl, type NavItem } from "@/data/site";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ControllerButton } from "@/components/ui/ControllerButton";
import { Wordmark } from "./Wordmark";
import { CartLink } from "@/components/cart/CartLink";

const icons: Record<NavItem["icon"], LucideIcon> = {
  home: House,
  shop: ShoppingBag,
  exchange: Repeat,
  repair: Wrench,
  zone: Gamepad2,
  contact: Phone,
};

const isActive = (pathname: string, href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

export function Nav() {
  const pathname = usePathname();
  const [compact, setCompact] = useState(false);
  const compactRef = useRef(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => {
    const next = y > 40;
    if (compactRef.current === next) return;
    compactRef.current = next;
    setCompact(next);
  });

  return (
    <>
      {/* Top bar: floating glass pill on desktop, slim brand bar on mobile */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-5 sm:pt-4">
        <div className={`glass-nav pointer-events-auto flex w-full items-center justify-between gap-3 rounded-full py-1.5 pl-5 pr-1.5 transition-[max-width,box-shadow] duration-500 ease-out [box-shadow:var(--shadow-card)] ${compact ? "max-w-[62rem]" : "max-w-6xl"}`}>
          <Wordmark />

          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative whitespace-nowrap rounded-full px-3.5 py-3 font-display text-xs font-semibold uppercase tracking-[0.14em] xl:px-4 xl:tracking-[0.16em] transition-colors ${active ? "text-accent-ink" : "text-muted hover:text-ink"}`}
                >
                  {active && <m.span layoutId="nav-pill" transition={{ type: "spring", stiffness: 420, damping: 34 }} className="absolute inset-0 rounded-full bg-gradient-to-b from-fill to-fill-2" />}
                  <span className="relative">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <CartLink />
            <div className="hidden xl:block">
              <ControllerButton href={whatsappUrl("Hi GamexChange, I have an enquiry.")} external glyph="x" size="sm">
                WhatsApp
              </ControllerButton>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Mobile: console-style bottom dock */}
      <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
        <ul className="glass-nav mx-auto grid max-w-lg grid-cols-6 rounded-2xl p-1 [box-shadow:var(--shadow-card)]">
          {navItems.map((item) => {
            const Icon = icons[item.icon];
            const active = isActive(pathname, item.href);
            const label = "short" in item ? item.short : item.label;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-semibold uppercase tracking-wide touch-manipulation transition-colors ${active ? "text-accent-ink" : "text-muted"}`}
                >
                  {active && <m.span layoutId="dock-pill" transition={{ type: "spring", stiffness: 420, damping: 34 }} className="absolute inset-0.5 rounded-xl bg-gradient-to-b from-fill to-fill-2" />}
                  <Icon className="relative size-5" aria-hidden />
                  <span className="relative">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
