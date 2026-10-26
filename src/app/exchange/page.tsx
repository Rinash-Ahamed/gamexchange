import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { ExchangeWizard } from "@/components/zone/ExchangeWizard";

export const metadata: Metadata = {
  title: "Sell or exchange your console",
  description: "Sell your console for cash or trade it toward an upgrade. The shop confirms the offer after checking your device.",
  alternates: { canonical: "/exchange" },
};

export default function ExchangePage() {
  return (
    <main>
      <PageHero title={<>Level up<br /><span className="text-gradient">your setup.</span></>}>
        Sell your console for cash or exchange it for an upgrade. Four steps to sell, five to exchange. The shop checks your device and confirms an offer.
      </PageHero>
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <ExchangeWizard />
      </div>
    </main>
  );
}
