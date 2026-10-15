import type { Metadata, Viewport } from "next";
import { chakra, inter } from "@/lib/fonts";
import { themeBootScript } from "@/lib/theme";
import { localBusinessJsonLd } from "@/lib/structured-data";
import { site } from "@/data/site";
import { Providers } from "@/components/ui/Providers";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const description =
  "Buy, sell and exchange gaming consoles, controllers and accessories. Expert PlayStation and Xbox repairs and an immersive gaming zone in Coimbatore.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "GamexChange | Buy, Sell, Exchange & Repair Gaming Consoles", template: "%s · GamexChange" },
  description,
  openGraph: { type: "website", siteName: site.name, title: "GamexChange | Your Game. Your Rules.", description, locale: "en_IN" },
  twitter: { card: "summary_large_image" },
  appleWebApp: { capable: true, title: "GamexChange", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#07090f",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning className={`${chakra.variable} ${inter.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body>
        <a href="#main" className="sr-only z-[60] rounded-full bg-fill px-4 py-2 text-accent-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
          Skip to content
        </a>
        <Providers>
          <Nav />
          <div id="main" className="overflow-x-clip">{children}</div>
          <Footer />
        </Providers>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd()) }} />
      </body>
    </html>
  );
}
