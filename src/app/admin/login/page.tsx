import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { Wordmark } from "@/components/layout/Wordmark";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { adminButtonClass, adminInputClass, adminLabelClass } from "@/components/admin/styles";
import { developmentLoginHint, getAdminSession } from "@/lib/admin/auth";
import { loginAction } from "./actions";

export const metadata: Metadata = { title: "Admin login", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const messages: Record<string, string> = {
  credentials: "The email or password is incorrect.",
  setup: "Admin access is not configured. Add the required environment variables and restart the server.",
};

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await getAdminSession()) redirect("/admin");
  const { error } = await searchParams;
  const hint = developmentLoginHint();

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

        {error && messages[error] && <p role="alert" className="mt-5 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{messages[error]}</p>}

        <form action={loginAction} className="mt-6 space-y-4">
          <div>
            <label htmlFor="admin-email" className={adminLabelClass}>Email</label>
            <input id="admin-email" name="email" type="email" autoComplete="username" required className={adminInputClass} />
          </div>
          <div>
            <label htmlFor="admin-password" className={adminLabelClass}>Password</label>
            <input id="admin-password" name="password" type="password" autoComplete="current-password" required className={adminInputClass} />
          </div>
          <button type="submit" className={`${adminButtonClass} w-full`}>Sign in</button>
        </form>

        {hint && (
          <div className="mt-5 rounded-xl border border-line bg-surface/70 px-4 py-3 text-xs text-muted">
            <p className="font-semibold text-ink">Development login</p>
            <p className="mt-1 break-all">{hint.email}</p>
            <p className="break-all">{hint.password}</p>
            <p className="mt-2">Replace these values in your local environment before sharing the app.</p>
          </div>
        )}
      </section>
    </main>
  );
}
