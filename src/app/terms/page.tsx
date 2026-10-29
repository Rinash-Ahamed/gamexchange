import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { PageHero } from "@/components/ui/PageHero";
import { terms } from "@/data/legal";

export const metadata: Metadata = { title: terms.title, description: terms.description, alternates: { canonical: "/terms" } };

export default function TermsPage() {
  return <main><PageHero title={<>Terms and<br /><span className="text-gradient">conditions.</span></>}>{terms.description}</PageHero><LegalDocument policy={terms} /></main>;
}
