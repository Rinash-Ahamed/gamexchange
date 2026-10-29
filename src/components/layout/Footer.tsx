import Link from "next/link";
import { branches, mapsUrl, navItems, site, whatsappUrl } from "@/data/site";
import { Wordmark } from "./Wordmark";
import { FooterVideo } from "./FooterVideo";
import { SocialIcon } from "@/components/ui/SocialIcon";

export function Footer() {
  return (
    <footer className="relative isolate mt-20 overflow-hidden border-t border-white/15 bg-[#050711] pb-24 pt-12 text-white lg:pb-10">
      <FooterVideo />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(3,5,14,0.92)_0%,rgba(3,5,14,0.78)_48%,rgba(3,5,14,0.9)_100%)]" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(3,5,14,0.34)_0%,rgba(3,5,14,0.72)_100%)]" />

      <div className="relative z-10 mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[1.4fr_1fr_1.4fr]">
        <div>
          <Wordmark className="footer-logo-heartbeat" />
          <p className="mt-4 max-w-sm text-white/75">Premium repairs, seamless upgrades and an immersive gaming zone in Coimbatore.</p>
          <nav aria-label="Social media" className="mt-4 flex flex-wrap gap-2">
            {([
              { network: "instagram", label: "Instagram", href: site.social.instagram },
              { network: "facebook", label: "Facebook", href: site.social.facebook },
              { network: "whatsapp", label: "WhatsApp", href: whatsappUrl() },
            ] as const).map((social) => <a key={social.network} href={social.href} aria-label={`${social.label} (opens in a new tab)`} title={social.label} target="_blank" rel="noopener noreferrer" className="grid size-11 place-items-center rounded-full border border-white/20 bg-white/5 text-white/80 transition-colors hover:border-[#a9bfff] hover:bg-white/10 hover:text-[#a9bfff]">
              <SocialIcon network={social.network} />
            </a>)}
          </nav>
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
      <div className="relative z-10 mx-auto mt-10 flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 text-xs text-white/60 sm:px-8">
        <p>© {new Date().getFullYear()} GamexChange. All rights reserved.</p>
        <nav aria-label="Legal" className="flex flex-wrap gap-x-5">
          <Link href="/terms" className="py-3 transition-colors hover:text-white">Terms and conditions</Link>
          <Link href="/policies" className="py-3 transition-colors hover:text-white">Policies and support</Link>
        </nav>
      </div>
    </footer>
  );
}
