/** Shared business facts; branch list and hours updated by the owner on 2026-11-03. */

export type Branch = {
  id: "sungam" | "karumbukkadai" | "pollachi";
  name: string;
  area: string;
  mapsUrl: string;
};

export const site = {
  name: "GameXchange",
  url: "https://gamexchange.co.in",
  tagline: "Buy. Sell. Exchange. Repair. Play.",
  city: "Coimbatore",
  region: "Tamil Nadu",
  country: "IN",
  whatsappNumber: "917708845461",
  hours: { open: "10:00", close: "20:00", display: "10 AM to 8 PM", days: "All Days" },
  social: {
    instagram: "https://www.instagram.com/gamexchg/",
    facebook: "https://www.facebook.com/gamexchange.gamexchange",
  },
  sellFormUrl:
    "https://docs.google.com/forms/d/e/1FAIpQLSehnb8wcZT53SmbtiRKkoJan3usvmHkkahevcQXHisx9iviSw/viewform?pli=1",
  repairTurnaround: "1–7 days",
} as const;

export const branches: readonly Branch[] = [
  {
    id: "sungam",
    name: "Sungam Bypass Rd",
    area: "Coimbatore, Tamil Nadu",
    mapsUrl: "https://share.google/bvHfeXQzB58OvCfh7",
  },
  {
    id: "karumbukkadai",
    name: "Karumbukkadai",
    area: "Coimbatore, Tamil Nadu",
    mapsUrl: "https://share.google/FX0kiUr25sfzvjfwi",
  },
  {
    id: "pollachi",
    name: "Pollachi",
    area: "Pollachi, Tamil Nadu",
    mapsUrl: "https://share.google/A4UN3avHiiTfG0ysa",
  },
];

export const mapsUrl = (b: Branch) => b.mapsUrl;

export const whatsappUrl = (message?: string) =>
  `https://wa.me/${site.whatsappNumber}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

export const navItems = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/products", label: "Shop", icon: "shop" },
  { href: "/exchange", label: "Trade", short: "Trade", icon: "exchange" },
  { href: "/repair-service", label: "Repairs", short: "Repair", icon: "repair" },
  { href: "/game-zone", label: "Game Zone", short: "Zone", icon: "zone" },
  { href: "/contact", label: "Contact", icon: "contact" },
] as const;

export type NavItem = (typeof navItems)[number];
