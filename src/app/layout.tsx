import type { Metadata, Viewport } from "next";
import { chakra, inter } from "@/lib/fonts";
import { localBusinessJsonLd } from "@/lib/structured-data";
import { JsonLd } from "@/components/seo/JsonLd";
import { site } from "@/data/site";
import { Providers } from "@/components/ui/Providers";
import { SiteChrome } from "@/components/layout/SiteChrome";
import "./globals.css";

const description =
  "Buy, sell and exchange gaming consoles, controllers and accessories. Expert PlayStation and Xbox repairs and an immersive gaming zone in Coimbatore.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "GameXchange | Buy, Sell, Exchange & Repair Gaming Consoles", template: "%s · GameXchange" },
  description,
  openGraph: { type: "website", siteName: site.name, title: "GameXchange | Your Game. Your Rules.", description, locale: "en_IN" },
  twitter: { card: "summary_large_image" },
  appleWebApp: { capable: true, title: "GameXchange", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#07090f",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" data-scroll-behavior="smooth" suppressHydrationWarning className={`${chakra.variable} ${inter.variable}`}>
      <body>
        <a id="skip-to-content" href="#main" className="sr-only z-[60] rounded-full bg-fill px-4 py-2 text-accent-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
          Skip to content
        </a>
        <div id="admin-notices" className="pointer-events-none fixed inset-x-4 top-4 z-[150] mx-auto flex max-h-[calc(100dvh-2rem)] max-w-lg flex-col gap-3 overflow-y-auto" />
        <Providers>
          <SiteChrome>
            <div id="main" className="overflow-x-clip">{children}</div>
          </SiteChrome>
        </Providers>
        <JsonLd id="gamexchange-local-business-jsonld" data={localBusinessJsonLd()} />
      </body>
    </html>
  );
}
