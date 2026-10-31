"use client";

import { AdminNotice } from "@/components/admin/AdminNotice";
import Image from "next/image";
import { useActionState, useEffect, useRef, useState } from "react";
import { saveBannerAction, type BannerSaveState } from "@/app/admin/banner-actions";
import { bannerImageRequirements as requirements } from "@/data/banners";
import type { AdminBanner } from "@/lib/admin/banners";
import { adminButtonClass, adminFileInputClass, adminGhostButtonClass, adminInputClass, adminLabelClass } from "./styles";
import { ConfirmSubmit } from "./ConfirmSubmit";
import { imageLoading } from "@/lib/image-loading";

const initialState: BannerSaveState = {};

export function BannerEditor({ banner, nextPosition = 1, storageConfigured }: { banner?: AdminBanner; nextPosition?: number; storageConfigured: boolean }) {
  const [state, action, pending] = useActionState(saveBannerAction, initialState);
  const [selected, setSelected] = useState("");
  const [fileError, setFileError] = useState("");
  const [headline, setHeadline] = useState(banner?.headline ?? "");
  const [description, setDescription] = useState(banner?.description ?? "");
  const [mobilePreview, setMobilePreview] = useState(false);
  const [fields, setFields] = useState({ title: banner?.title ?? "", alt: banner?.alt ?? "", position: String(banner?.position ?? nextPosition), status: banner?.status ?? "draft" });
  const form = useRef<HTMLFormElement>(null);
  const preview = selected || banner?.image;
  const previousSave = useRef<number | undefined>(undefined);

  useEffect(() => () => { if (selected) URL.revokeObjectURL(selected); }, [selected]);
  useEffect(() => {
    if (!state.saved || state.saved === previousSave.current) return;
    previousSave.current = state.saved;
    const fileInput = form.current?.elements.namedItem("image");
    if (fileInput instanceof HTMLInputElement) fileInput.value = "";
    if (!banner) form.current?.reset();
    queueMicrotask(() => {
      setSelected(""); setFileError("");
      if (!banner) {
        setHeadline(""); setDescription("");
        setFields({ title: "", alt: "", position: String(nextPosition), status: "draft" });
      }
    });
  }, [state.saved, banner, nextPosition]);
  useEffect(() => {
    if (state.error) queueMicrotask(() => setSelected(""));
  }, [state]);

  return (
    <ConfirmSubmit formRef={form} submitAction={action} className="space-y-4" intent="primary" title={fields.status === "published" ? "Publish this banner?" : banner?.status === "published" ? "Unpublish this banner?" : "Save banner draft?"} confirmLabel={fields.status === "published" ? "Publish banner" : banner?.status === "published" ? "Unpublish and save" : "Save draft"} cancelLabel="Keep editing" message={fields.status === "published" ? "Save this banner and make it visible on the homepage? Its artwork, text and display order will be updated." : banner?.status === "published" ? "Remove this banner from the public carousel and save it as a draft?" : "Save this draft in the admin portal? It will remain hidden from the website."}>
      {banner && <input type="hidden" name="id" value={banner.id} />}
      <fieldset disabled={pending} className="min-w-0 space-y-4 disabled:opacity-60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Artwork preview</p>
          <div className="flex gap-2">
            <button type="button" aria-pressed={!mobilePreview} onClick={() => setMobilePreview(false)} className={`${adminGhostButtonClass} aria-pressed:border-blue aria-pressed:text-accent-text`}>Desktop</button>
            <button type="button" aria-pressed={mobilePreview} onClick={() => setMobilePreview(true)} className={`${adminGhostButtonClass} aria-pressed:border-blue aria-pressed:text-accent-text`}>Mobile crop</button>
          </div>
        </div>
        <div className={`relative isolate overflow-hidden rounded-2xl border border-line-strong bg-[#05070c] text-white ${mobilePreview ? "mx-auto aspect-[5/4] w-full max-w-[15rem]" : "aspect-[16/7]"}`}>
          {preview ? <Image src={preview} alt="Banner preview" fill unoptimized sizes="(min-width: 1280px) 600px, 100vw" {...imageLoading("visible")} className="object-cover" /> : <p className="absolute inset-0 grid place-items-center px-6 text-center text-sm text-white/60">Choose a banner image to preview it here.</p>}
          {(headline || description) && (
            <>
              <span aria-hidden className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
              <div className="absolute inset-y-0 left-5 flex w-[48%] flex-col justify-center py-4">
                {headline && <p className="break-words font-display text-[clamp(1rem,2.2vw,2.4rem)] font-bold uppercase leading-tight">{headline}</p>}
                {description && !mobilePreview && <p className="mt-2 hidden text-xs text-white/80 sm:block">{description}</p>}
              </div>
            </>
          )}
        </div>
        {mobilePreview && <p className="text-xs text-muted">Approximate crop on a small phone. Check that your logo, dates and key message stay visible.</p>}
        <div>
          <label htmlFor={`banner-image-${banner?.id ?? "new"}`} className={adminLabelClass}>{banner ? "Replace image (optional)" : "Banner image"}</label>
          <input
            id={`banner-image-${banner?.id ?? "new"}`}
            name="image" type="file" accept="image/jpeg,image/png,image/webp" required={!banner} disabled={!storageConfigured}
            aria-describedby="banner-size-requirements"
            className={adminFileInputClass}
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              setFileError("");
              setSelected("");
              if (!file) return;
              if (file.size > requirements.maxBytes || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
                setFileError("Choose a JPG, PNG or WebP image up to 5 MB.");
                event.currentTarget.value = "";
                return;
              }
              setSelected(URL.createObjectURL(file));
            }}
          />
          {fileError && <p role="alert" className="mt-2 text-sm text-danger">{fileError}</p>}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="sm:col-span-2"><span className={adminLabelClass}>Banner name (admin only)</span><input name="title" required maxLength={100} value={fields.title} onChange={(event) => setFields({ ...fields, title: event.target.value })} placeholder="November game releases" className={adminInputClass} /></label>
          <label className="sm:col-span-2"><span className={adminLabelClass}>Image description for accessibility</span><input name="alt" required maxLength={200} value={fields.alt} onChange={(event) => setFields({ ...fields, alt: event.target.value })} placeholder="Describe the game or promotion shown in the image" className={adminInputClass} /></label>
          <label className="sm:col-span-2"><span className={adminLabelClass}>Headline (optional)</span><input name="headline" maxLength={70} value={headline} onChange={(event) => setHeadline(event.target.value)} placeholder="Leave empty if your poster already contains text" className={adminInputClass} /></label>
          <label className="sm:col-span-2"><span className={adminLabelClass}>Supporting text (optional)</span><textarea name="description" rows={2} maxLength={180} value={description} onChange={(event) => setDescription(event.target.value)} className={`${adminInputClass} py-3`} /></label>
          <label><span className={adminLabelClass}>Display order</span><input name="position" type="number" min={1} max={999} required value={fields.position} onChange={(event) => setFields({ ...fields, position: event.target.value })} className={adminInputClass} /></label>
          <label><span className={adminLabelClass}>Visibility</span><select name="status" value={fields.status} onChange={(event) => setFields({ ...fields, status: event.target.value as "draft" | "published" })} className={adminInputClass}><option value="draft">Draft (hidden)</option><option value="published">Published (live)</option></select></label>
        </div>
        <p className="text-xs text-muted">Headline and supporting text are optional.</p>
        <button type="submit" disabled={Boolean(fileError) || (!banner && !storageConfigured)} className={`${adminButtonClass} w-full disabled:cursor-not-allowed disabled:opacity-50`}>{pending ? "Uploading and saving..." : banner ? "Save changes" : "Save banner"}</button>
      </fieldset>
      {state.error && <p role="alert" className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{state.error} If you were uploading an image, select it again before retrying. Your text and visibility selections are kept.</p>}
{state.message && <AdminNotice key={state.saved} clearQuery={false}>{state.message}</AdminNotice>}
    </ConfirmSubmit>
  );
}
