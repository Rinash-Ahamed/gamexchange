import Link from "next/link";
import { branches, mapsUrl, navItems, site, whatsappUrl } from "@/data/site";
import { Wordmark } from "./Wordmark";

export function Footer() {
  return (
    <footer className="relative mt-20 border-t border-line pb-24 pt-12 lg:pb-10">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[1.4fr_1fr_1.4fr]">
        <div>
          <Wordmark />
          <p className="mt-4 max-w-sm text-muted">Premium repairs, seamless upgrades and an immersive gaming zone in Coimbatore.</p>
          <p className="mt-4 flex flex-wrap gap-x-2 text-sm">
            <a className="inline-flex min-h-11 items-center px-2 underline-offset-4 hover:underline" href={site.social.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
            <a className="inline-flex min-h-11 items-center px-2 underline-offset-4 hover:underline" href={site.social.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>
            <a className="inline-flex min-h-11 items-center px-2 underline-offset-4 hover:underline" href={whatsappUrl()} target="_blank" rel="noopener noreferrer">WhatsApp</a>
          </p>
        </div>

        <nav aria-label="Footer">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-accent-text">Explore</p>
          <ul className="mt-4 space-y-1">
            {navItems.map((i) => (
              <li key={i.href}>
                <Link href={i.href} className="inline-block py-1.5 text-muted transition-colors hover:text-ink">{i.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-accent-text">Visit</p>
          <ul className="mt-4 space-y-5">
            {branches.map((b) => (
              <li key={b.id}>
                <p className="font-semibold">{b.name} · {b.area}</p>
                <p className="text-sm text-muted">{site.hours.display} · {site.hours.closedDay} closed</p>
                <p className="mt-1 flex gap-4 text-sm">
                  <a className="inline-flex min-h-11 items-center px-2 underline-offset-4 hover:underline" href={`tel:${b.phone}`}>{b.phoneDisplay}</a>
                  <a className="inline-flex min-h-11 items-center px-2 underline-offset-4 hover:underline" href={mapsUrl(b)} target="_blank" rel="noopener noreferrer">Directions</a>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-7xl px-5 text-xs text-muted sm:px-8">© {new Date().getFullYear()} GamexChange. All rights reserved.</p>
    </footer>
  );
}
