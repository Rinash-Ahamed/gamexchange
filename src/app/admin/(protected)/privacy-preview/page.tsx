import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Privacy policy", robots: { index: false, follow: false } };

export default async function PrivacyPreviewPage() {
  await requireAdmin();
  redirect("/policies/privacy-policy");
}
