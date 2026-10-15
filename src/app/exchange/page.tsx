import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { ExchangeWizard } from "@/components/zone/ExchangeWizard";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Sell or exchange your console",
  description: "Trade in your old console toward an upgrade. Send a quick enquiry. The shop confirms the offer after checking your device.",
  alternates: { canonical: "/exchange" },
};

export default function ExchangePage() {
  return (
    <main>
      <PageHero title={<>Level up<br /><span className="text-gradient">your setup.</span></>}>
        Five quick steps. We don’t quote trade-in values online. The shop checks your device and confirms an offer.
      </PageHero>
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <ExchangeWizard />
        <p className="mt-6 text-center text-sm text-muted">
          Want to sell outright instead?{" "}
          <a className="underline underline-offset-4 hover:text-ink" href={site.sellFormUrl} target="_blank" rel="noopener noreferrer">Use our sell form</a>.
        </p>
      </div>
    </main>
  );
}
