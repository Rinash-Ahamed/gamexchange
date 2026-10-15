import Link from "next/link";
import { branches, mapsUrl, navItems, site, whatsappUrl } from "@/data/site";
import { Wordmark } from "./Wordmark";

export function Footer() {
  return (
    <footer className="relative isolate mt-20 overflow-hidden border-t border-white/15 bg-[#050711] pb-24 pt-12 text-white lg:pb-10">
      <video
        aria-hidden="true"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        tabIndex={-1}
        className="absolute inset-0 -z-20 size-full object-cover object-center motion-reduce:hidden"
      >
        <source src="/video/footervideo.mp4" type="video/mp4" />
      </video>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(3,5,14,0.92)_0%,rgba(3,5,14,0.78)_48%,rgba(3,5,14,0.9)_100%)]" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(3,5,14,0.34)_0%,rgba(3,5,14,0.72)_100%)]" />

      <div className="relative z-10 mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[1.4fr_1fr_1.4fr]">
        <div>
          <Wordmark className="footer-logo-heartbeat" />
          <p className="mt-4 max-w-sm text-white/75">Premium repairs, seamless upgrades and an immersive gaming zone in Coimbatore.</p>
          <p className="mt-4 flex flex-wrap gap-x-2 text-sm">
            <a className="inline-flex min-h-11 items-center px-2 underline-offset-4 transition-colors hover:text-white/75 hover:underline" href={site.social.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
            <a className="inline-flex min-h-11 items-center px-2 underline-offset-4 transition-colors hover:text-white/75 hover:underline" href={site.social.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>
            <a className="inline-flex min-h-11 items-center px-2 underline-offset-4 transition-colors hover:text-white/75 hover:underline" href={whatsappUrl()} target="_blank" rel="noopener noreferrer">WhatsApp</a>
          </p>
        </div>

        <nav aria-label="Footer">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-[#a9bfff]">Explore</p>
          <ul className="mt-4 space-y-1">
            {navItems.map((i) => (
              <li key={i.href}>
                <Link href={i.href} className="inline-block py-1.5 text-white/75 transition-colors hover:text-white">{i.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-[#a9bfff]">Visit</p>
          <ul className="mt-4 space-y-5">
            {branches.map((b) => (
              <li key={b.id}>
                <p className="font-semibold">{b.name} · {b.area}</p>
                <p className="text-sm text-white/70">{site.hours.display} · {site.hours.closedDay} closed</p>
                <p className="mt-1 flex gap-4 text-sm">
                  <a className="inline-flex min-h-11 items-center px-2 underline-offset-4 transition-colors hover:text-white/75 hover:underline" href={`tel:${b.phone}`}>{b.phoneDisplay}</a>
                  <a className="inline-flex min-h-11 items-center px-2 underline-offset-4 transition-colors hover:text-white/75 hover:underline" href={mapsUrl(b)} target="_blank" rel="noopener noreferrer">Directions</a>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="relative z-10 mx-auto mt-10 max-w-7xl px-5 text-xs text-white/60 sm:px-8">© {new Date().getFullYear()} GamexChange. All rights reserved.</p>
    </footer>
  );
}
