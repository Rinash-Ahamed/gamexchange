import Link from "next/link";
import { LogOut, Store } from "lucide-react";
import { AdminNav } from "@/components/admin/AdminNav";
import { Wordmark } from "@/components/layout/Wordmark";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { adminGhostButtonClass } from "@/components/admin/styles";
import { requireAdmin } from "@/lib/admin/auth";
import { logoutAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  return (
    <div className="min-h-dvh bg-void lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="border-b border-line bg-surface/80 p-4 backdrop-blur lg:sticky lg:top-0 lg:h-dvh lg:border-b-0 lg:border-r lg:p-5">
        <div className="flex items-center justify-between gap-3">
          <Wordmark />
          <ThemeToggle />
        </div>
        <div className="mt-5"><AdminNav /></div>
        <div className="mt-5 border-t border-line pt-4 lg:absolute lg:inset-x-5 lg:bottom-5">
          <p className="truncate text-xs text-muted">{session.email}</p>
          <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-1">
            <Link href="/" className={adminGhostButtonClass}><Store className="mr-2 size-4" aria-hidden />View store</Link>
            <form action={logoutAction}>
              <button type="submit" className={`${adminGhostButtonClass} w-full`}><LogOut className="mr-2 size-4" aria-hidden />Sign out</button>
            </form>
          </div>
        </div>
      </aside>
      <main className="min-w-0 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">{children}</main>
    </div>
  );
}
