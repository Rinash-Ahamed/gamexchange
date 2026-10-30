import Link from "next/link";
import type { Metadata } from "next";
import { LogOut, Store } from "lucide-react";
import { AdminNav } from "@/components/admin/AdminNav";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { Wordmark } from "@/components/layout/Wordmark";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { adminGhostButtonClass } from "@/components/admin/styles";
import { requireAdmin } from "@/lib/admin/auth";
import { logoutAction } from "../actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  return (
    <div className="min-h-dvh bg-void lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
      <aside data-native-scroll className="border-b border-line bg-surface/80 p-3 backdrop-blur lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:overflow-y-auto lg:border-b-0 lg:border-r lg:p-4">
        <div className="flex items-center justify-between gap-3">
          <Wordmark />
          <ThemeToggle />
        </div>
        <div className="mt-5"><AdminNav /></div>
        <div className="mt-5 border-t border-line pt-4 lg:mt-auto">
          <p className="truncate text-xs text-muted">{session.email}</p>
          <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-1">
            <Link href="/" className={adminGhostButtonClass}><Store className="mr-2 size-4" aria-hidden />View store</Link>
            <ConfirmSubmit submitAction={logoutAction} title="Sign out of admin?" confirmLabel="Sign out" cancelLabel="Stay signed in" intent="primary" message="End this admin session? Save any unfinished edits before signing out.">
              <button type="submit" className={`${adminGhostButtonClass} w-full`}><LogOut className="mr-2 size-4" aria-hidden />Sign out</button>
            </ConfirmSubmit>
          </div>
        </div>
      </aside>
      <main className="min-w-0 px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
