import type { Metadata } from "next";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { BannerEditor } from "@/components/admin/BannerEditor";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { adminGhostButtonClass } from "@/components/admin/styles";
import { bannerStorageConfigured, listAdminBanners } from "@/lib/admin/banners";
import { requireAdmin } from "@/lib/admin/auth";
import { deleteBannerAction } from "../../banner-actions";

export const metadata: Metadata = { title: "Homepage banners", robots: { index: false, follow: false } };

export default async function BannersPage({ searchParams }: { searchParams: Promise<{ notice?: string; error?: string }> }) {
  await requireAdmin();
  const [banners, query] = await Promise.all([listAdminBanners(), searchParams]);
  const storageConfigured = bannerStorageConfigured();
  const live = banners.filter((banner) => banner.status === "published").length;
  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="font-display text-3xl font-bold uppercase sm:text-4xl">Homepage banners</h1><p className="mt-2 text-muted">Manage the artwork inside The Next Level carousel. Up to five published banners rotate every 2.5 seconds.</p></div>
        <Link href="/#promo-switch-heading" target="_blank" rel="noopener noreferrer" className={adminGhostButtonClass}>View on website</Link>
      </div>
      {!storageConfigured && <p role="alert" className="mt-6 rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">Image uploads need Firebase Storage. Create or open your Storage bucket and add FIREBASE_STORAGE_BUCKET to your environment, then restart the server.</p>}
      {query.notice === "deleted" && <p role="status" className="mt-6 rounded-xl border border-ok/30 bg-ok/10 p-3 text-sm text-ok">Banner deleted.</p>}
      {query.error && <p role="alert" className="mt-6 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">The banner could not be deleted. Refresh and try again.</p>}
      <aside id="banner-size-requirements" className="metal mt-6 rounded-2xl p-5 text-sm leading-relaxed">
        <h2 className="font-display text-lg font-bold uppercase">Artwork requirements</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-muted">
          <li>Recommended: <strong className="text-ink">1920 × 840 pixels, landscape, 16:7 ratio.</strong></li>
          <li>Minimum: 1280 × 560 px. Maximum: 4096 × 1792 px. The aspect ratio must be within 2% of 16:7.</li>
          <li>JPG, PNG or WebP, up to 5 MB. Static images only. Files are optimized to WebP before storage.</li>
          <li>Keep logos, release dates and essential text inside the central 50% of the artwork, with 10% space above and below. Mobile uses a taller screen and crops the left and right edges.</li>
          <li>For text placed by the website, leave the left half uncluttered. For a finished poster, leave the optional headline and supporting text empty.</li>
          <li>Save as Draft to prepare a promotion, then select Published and save to make it live. Up to 20 saved banners and five published at once.</li>
        </ul>
      </aside>
      <details className="metal mt-6 rounded-3xl p-5 sm:p-6">
        <summary className="cursor-pointer font-display text-lg font-bold uppercase">Add banner</summary>
        <div className="mt-5 max-w-3xl"><BannerEditor storageConfigured={storageConfigured} nextPosition={Math.min(999, Math.max(0, ...banners.map((banner) => banner.position)) + 1)} /></div>
      </details>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3"><h2 className="font-display text-xl font-bold uppercase">Saved banners</h2><p className="text-sm text-muted">{live} / 5 published · {banners.length} / 20 saved</p></div>
      <div className="mt-4 grid gap-5 xl:grid-cols-2">
        {banners.map((banner) => (
          <article key={banner.id} className="metal min-w-0 rounded-3xl p-5 sm:p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><h3 className="font-display text-lg font-bold uppercase">{banner.title}</h3><span className="rounded-full border border-line-strong px-3 py-1 text-xs font-semibold">{banner.status === "published" ? "Published" : "Draft"} · Order {banner.position}</span></div>
            <BannerEditor banner={banner} storageConfigured={storageConfigured} />
            <div className="mt-4 flex justify-end"><ConfirmSubmit submitAction={deleteBannerAction} title="Delete banner?" message={`Delete ${banner.title} and its uploaded artwork? This cannot be undone.`}><input type="hidden" name="id" value={banner.id} /><button type="submit" className={`${adminGhostButtonClass} text-danger hover:border-danger`}><Trash2 className="mr-2 size-4" aria-hidden />Delete banner</button></ConfirmSubmit></div>
          </article>
        ))}
      </div>
      {!banners.length && <p className="mt-4 rounded-2xl border border-dashed border-line-strong p-8 text-muted">No banners saved. Add a banner above. The homepage carousel stays hidden until a banner is published.</p>}
    </div>
  );
}
