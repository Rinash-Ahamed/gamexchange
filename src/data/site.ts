/** Business facts, all taken from the live gamexchange.co.in site (audited 2026-10-13). */

export type Branch = {
  id: "sungam" | "selvapuram";
  name: string;
  area: string;
  phone: string;
  phoneDisplay: string;
  lat: number;
  lng: number;
};

export const site = {
  name: "GamexChange",
  url: "https://gamexchange.co.in",
  tagline: "Buy. Sell. Exchange. Repair. Play.",
  city: "Coimbatore",
  region: "Tamil Nadu",
  country: "IN",
  whatsappNumber: "917708845461",
  hours: { open: "11:00", close: "20:30", display: "11:00 AM – 8:30 PM", closedDay: "Friday" },
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
    name: "Branch 1",
    area: "Sungam, Coimbatore",
    phone: "+917708845461",
    phoneDisplay: "+91 77088 45461",
    lat: 10.991712292980997,
    lng: 76.97845181698383,
  },
  {
    id: "selvapuram",
    name: "Branch 2",
    area: "Selvapuram South, Coimbatore",
    phone: "+918248002523",
    phoneDisplay: "+91 82480 02523",
    lat: 10.988305577740958,
    lng: 76.94038836707266,
  },
];

export const mapsUrl = (b: Branch) => `https://www.google.com/maps?q=${b.lat},${b.lng}`;

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
