import { adminFranchisePhotos } from "@/lib/admin/franchise";
import { requireAdmin } from "@/lib/admin/auth";
import { saveFranchiseAction, deleteFranchiseAction } from "../../franchise-actions";
import { FranchiseFields } from "@/components/admin/FranchiseFields";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { adminButtonClass, adminGhostButtonClass } from "@/components/admin/styles";
export default async function Page({ searchParams }: { searchParams: Promise<{ notice?: string; error?: string; saved?: string }> }) {
  await requireAdmin();
  const [photos, query] = await Promise.all([adminFranchisePhotos(), searchParams]);
  return <div className="mx-auto max-w-6xl">
    <h1 className="font-display text-2xl font-bold uppercase">Franchise photos & locations</h1>
    <p className="mt-2 text-sm leading-6 text-muted">Manage store photos and locations. Publish photos to show them on the franchise page.</p>
    <p className="mt-3 text-xs leading-5 text-muted">Recommended: 1200 x 900 px. JPG, PNG or WebP, up to 5 MB.</p>
    {query.notice && <AdminNotice key={query.saved} className="mt-4">{query.notice === "deleted" ? "Franchise photo deleted." : "Franchise photo saved."}</AdminNotice>}
    {query.error && <p role="alert" className="mt-4 text-sm text-danger">{query.error === "invalid" ? "Complete the city, state, location and image description. Check the display order." : "Could not save this change. Check your image and connection, then try again. Contact support if the problem continues."}</p>}
    <details key={query.saved ?? "new"} className="mt-5 rounded-2xl border border-line-strong bg-surface p-4"><summary className="min-h-11 cursor-pointer font-display font-semibold">Add franchise photo</summary>
      <ConfirmSubmit submitAction={saveFranchiseAction} title="Save franchise photo?" message="Save this store image and location? Published photos appear in the franchise gallery; drafts stay private." confirmLabel="Save photo" intent="primary" className="mt-3 grid gap-3 sm:grid-cols-2"><FranchiseFields /><div className="sm:col-span-2"><button type="submit" className={adminButtonClass}>Save photo</button></div></ConfirmSubmit>
    </details>
    <div className="mt-5 space-y-3">{photos.map((photo) => <article key={photo.id} className="rounded-2xl border border-line-strong bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><div className="min-w-0"><h2 className="break-words font-display font-semibold">{photo.title}</h2><p className="mt-1 text-xs text-muted">{photo.status === "published" ? "Published" : "Draft"}{photo.state ? ` · ${photo.state}` : ""}</p></div>
        <ConfirmSubmit submitAction={deleteFranchiseAction} title="Delete franchise photo?" message={`Remove ${photo.title} and its uploaded artwork? This cannot be undone.`}><input name="id" type="hidden" value={photo.id} /><button type="submit" className={`${adminGhostButtonClass} text-danger`}>Delete</button></ConfirmSubmit>
      </div>
      <details className="mt-3"><summary className="min-h-11 cursor-pointer text-sm font-semibold text-accent-text">Edit photo & location</summary>
        {(!photo.city || !photo.state || !photo.location) && <p className="mt-2 text-xs text-muted">Add the city, state and locality before saving.</p>}
        <ConfirmSubmit submitAction={saveFranchiseAction} title="Update franchise photo?" message="Save this photo, location and visibility? Published changes update the franchise page." confirmLabel="Save changes" intent="primary" className="mt-3 grid gap-3 sm:grid-cols-2"><FranchiseFields photo={photo} /><div className="sm:col-span-2"><button type="submit" className={adminButtonClass}>Save changes</button></div></ConfirmSubmit>
      </details>
    </article>)}</div>
    {!photos.length && <p className="mt-5 text-sm text-muted">No photos saved. Add a store photo above.</p>}
  </div>;
}
