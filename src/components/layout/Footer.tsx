import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { site, whatsappUrl } from "@/data/site";
import { businessDetails } from "@/data/legal";
import { Wordmark } from "./Wordmark";
import { FooterVideo } from "./FooterVideo";
import { SocialIcon } from "@/components/ui/SocialIcon";

const legalLinks = [
  { href: "/terms", label: "Terms and conditions" },
  { href: "/policies/returns-and-refunds", label: "Cancellation & refunds" },
  { href: "/policies/shipping-and-delivery", label: "Shipping policy" },
  { href: "/policies/trade-in", label: "Sell & exchange policy" },
  { href: "/policies", label: "All store policies" },
];
const helpLinks = [
  { href: "/#faq-h", label: "FAQs" },
  { href: "/contact", label: "Customer support" },
  { href: "/repair-service", label: "Repairs & servicing" },
  { href: "/franchise", label: "Franchise opportunities" },
  { href: "/contact", label: "Find a store" },
];
const linkClass = "inline-flex min-h-11 items-center text-sm leading-6 text-white/75 transition-colors hover:text-white focus-visible:outline-offset-4";
const headingClass = "font-display text-base font-semibold text-[#a9bfff]";

export function Footer() {
  return (
    <footer className="relative isolate mt-16 overflow-hidden border-t border-white/15 bg-[#050711] pb-24 pt-9 text-white lg:pb-7">
      <FooterVideo />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(3,5,14,0.95),rgba(3,5,14,0.88),rgba(3,5,14,0.95))]" />
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-5 border-b border-white/15 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0"><Wordmark className="footer-logo-heartbeat" /><p className="mt-3 max-w-md text-sm leading-6 text-white/65">Gaming gear, expert repairs and a place to play.</p></div>
          <nav aria-label="Social media" className="flex flex-wrap gap-2">
            {([
              { network: "instagram", label: "Instagram", href: site.social.instagram },
              { network: "facebook", label: "Facebook", href: site.social.facebook },
              { network: "whatsapp", label: "WhatsApp", href: whatsappUrl() },
            ] as const).map((social) => <a key={social.network} href={social.href} aria-label={`${social.label} (opens in a new tab)`} title={social.label} target="_blank" rel="noopener noreferrer" className="grid size-11 place-items-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-[#a9bfff] hover:text-[#a9bfff]">
              <SocialIcon network={social.network} />
            </a>)}
          </nav>
        </div>

        <div className="grid gap-8 py-8 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.2fr] lg:gap-12">
          <nav aria-labelledby="footer-legal-heading" className="min-w-0">
            <h2 id="footer-legal-heading" className={headingClass}>Legal &amp; Policies</h2>
            <ul className="mt-3">{legalLinks.map(({ href, label }) => <li key={href}><Link href={href} className={linkClass}>{label}</Link></li>)}</ul>
          </nav>
          <nav aria-labelledby="footer-help-heading" className="min-w-0">
            <h2 id="footer-help-heading" className={headingClass}>Need Help</h2>
            <ul className="mt-3">{helpLinks.map(({ href, label }) => <li key={label}><Link href={href} className={linkClass}>{label}</Link></li>)}</ul>
          </nav>
          <section aria-labelledby="footer-contact-heading" className="min-w-0 sm:col-span-2 lg:col-span-1">
            <h2 id="footer-contact-heading" className={headingClass}>Contact Us</h2>
            <address className="mt-3 not-italic">
              <a href={`mailto:${businessDetails.email}`} className={`${linkClass} w-full gap-3`}><Mail className="size-4 shrink-0 text-[#a9bfff]" aria-hidden /><span className="min-w-0 break-all">{businessDetails.email}</span></a>
              <a href={`tel:${businessDetails.phone}`} className={`${linkClass} w-full gap-3`}><Phone className="size-4 shrink-0 text-[#a9bfff]" aria-hidden />{businessDetails.phoneDisplay}</a>
              <Link href="/contact" className={`${linkClass} w-full gap-3`}><MapPin className="size-4 shrink-0 text-[#a9bfff]" aria-hidden />Coimbatore, Tamil Nadu</Link>
            </address>
            <p className="mt-3 text-xs leading-6 text-white/60">{site.hours.display}<br />Closed on {site.hours.closedDay}s</p>
          </section>
        </div>
        <p className="border-t border-white/15 pt-5 text-center text-xs leading-6 text-white/55">© {new Date().getFullYear()} GamexChange, operated by {businessDetails.entity}. All rights reserved.</p>
      </div>
    </footer>
  );
}
