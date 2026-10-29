import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { PageHero } from "@/components/ui/PageHero";
import { policies } from "@/data/legal";

export function generateStaticParams() { return policies.map((policy) => ({ slug: policy.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const policy = policies.find((entry) => entry.slug === slug);
  if (!policy) notFound();
  return { title: policy.title, description: policy.description, alternates: { canonical: `/policies/${policy.slug}` } };
}

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const policy = policies.find((entry) => entry.slug === slug);
  if (!policy) notFound();
  return <main><PageHero title={<span className="text-gradient [overflow-wrap:anywhere]">{policy.title}</span>}>{policy.description}</PageHero><LegalDocument policy={policy} /></main>;
}
