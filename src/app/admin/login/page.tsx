import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { Wordmark } from "@/components/layout/Wordmark";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { FirebaseAdminLogin } from "@/components/admin/FirebaseAdminLogin";
import { adminAuthConfigured, getAdminSession } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Admin login", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await getAdminSession()) redirect("/admin");

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-5 py-12">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_20%,color-mix(in_srgb,var(--accent)_22%,transparent),transparent_42%),radial-gradient(circle_at_80%_85%,color-mix(in_srgb,var(--accent-2)_18%,transparent),transparent_36%)]" />
      <div className="absolute right-5 top-5"><ThemeToggle /></div>

      <section className="metal w-full max-w-md rounded-[2rem] p-6 sm:p-8" aria-labelledby="login-title">
        <div className="flex items-center justify-between gap-4">
          <Wordmark />
          <span className="grid size-11 place-items-center rounded-full border border-line-strong bg-surface-2 text-accent-text"><LockKeyhole className="size-5" aria-hidden /></span>
        </div>
        <h1 id="login-title" className="mt-8 font-display text-3xl font-bold uppercase">Admin access</h1>
        <p className="mt-2 text-sm text-muted">Manage inventory and customer service records.</p>

        <FirebaseAdminLogin serverConfigured={adminAuthConfigured()} />
      </section>
    </main>
  );
}
