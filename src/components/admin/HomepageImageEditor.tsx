"use client";
import Image from "next/image";
import { useActionState, useEffect, useRef, useState } from "react";
import { saveHomepageImageAction, type HomepageImageState } from "@/app/admin/homepage-image-actions";
import { imageLoading } from "@/lib/image-loading";
import { ConfirmSubmit } from "./ConfirmSubmit";
import { AdminNotice } from "./AdminNotice";
import { adminButtonClass, adminGhostButtonClass, adminFileInputClass } from "./styles";
const initial: HomepageImageState = {};
export function HomepageImageEditor({ id, title, image, custom }: { id: string; title: string; image: string; custom: boolean }) {
  const [state, action, pending] = useActionState(saveHomepageImageAction, initial);
  const [preview, setPreview] = useState("");
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  return <article className="flex min-w-0 flex-col rounded-2xl border border-line-strong bg-surface p-4">
    <h2 className="font-display text-base font-semibold leading-6 md:min-h-12">{title}</h2>
    <div className="relative mt-3 aspect-[4/3] overflow-hidden rounded-xl bg-surface-2"><Image key={preview || image} src={preview || image} alt={`${title} artwork preview`} fill unoptimized sizes="(min-width: 1024px) 400px, 90vw" {...imageLoading("visible")} className="object-contain" /></div>
    <ConfirmSubmit key={state.saved ?? "upload"} formRef={form} submitAction={action} title="Replace card image?" message={`Publish the selected image for ${title}? It will replace the current homepage artwork.`} confirmLabel="Publish image" cancelLabel="Keep editing" intent="primary" className="mt-4 grid gap-3">
      <input type="hidden" name="id" value={id} />
      <input aria-label={`Choose image for ${title}`} name="image" type="file" required accept="image/jpeg,image/png,image/webp" disabled={pending} className={adminFileInputClass} onChange={(event) => { const file = event.currentTarget.files?.[0]; if (file && (file.size > 5 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(file.type))) { event.currentTarget.setCustomValidity("Choose a JPG, PNG or WebP up to 5 MB."); event.currentTarget.reportValidity(); setPreview(""); return; } event.currentTarget.setCustomValidity(""); setPreview(file ? URL.createObjectURL(file) : ""); }} />
      <button type="submit" disabled={pending} className={`${adminButtonClass} w-full`}>{pending ? "Saving..." : "Publish image"}</button>
    </ConfirmSubmit>
    {custom && <ConfirmSubmit submitAction={action} title="Restore original image?" message={`Remove the uploaded artwork for ${title} and restore the original image?`} confirmLabel="Restore original" intent="danger" className="mt-3"><input type="hidden" name="id" value={id} /><input type="hidden" name="reset" value="true" /><button disabled={pending} type="submit" className={`${adminGhostButtonClass} w-full`}>Restore original</button></ConfirmSubmit>}
    {state.error && <p role="alert" className="mt-3 text-sm text-danger">{state.error}</p>}
    {state.message && <AdminNotice key={state.saved} clearQuery={false} className="mt-3">{state.message}</AdminNotice>}
  </article>;
}
