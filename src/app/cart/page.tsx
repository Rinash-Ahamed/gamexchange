import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { CartContents } from "@/components/cart/CartContents";
import { listPublicProducts } from "@/lib/admin/db";
import { availableCatalog } from "@/lib/catalog";
import { testCheckoutConfigured } from "@/lib/payments/razorpay";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your cart", robots: { index: false, follow: false } };
export default async function CartPage() {
  const products = availableCatalog(await listPublicProducts());
  return <main><PageHero title={<>Your <span className="text-gradient">loadout.</span></>}>All your selected gear, together. Review quantities before continuing.</PageHero><div className="mx-auto max-w-6xl px-5 pb-16 sm:px-8"><CartContents products={products} checkoutEnabled={testCheckoutConfigured()} /></div></main>;
}
