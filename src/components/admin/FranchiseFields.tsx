import Image from "next/image";
import type { FranchisePhoto } from "@/lib/admin/franchise";
import { franchiseImage } from "@/lib/admin/franchise";
import { imageLoading } from "@/lib/image-loading";
import { adminFileInputClass, adminInputClass, adminLabelClass } from "./styles";
export function FranchiseFields({ photo }: { photo?: FranchisePhoto }) {
  return <>
    {photo && <input type="hidden" name="id" value={photo.id} />}
    {(["city", "state", "location"] as const).map((field) => <label key={field} className="block"><span className={adminLabelClass}>{field === "location" ? "Location / locality" : field}</span><input name={field} defaultValue={photo?.[field]} required maxLength={field === "location" ? 180 : 100} className={adminInputClass} /></label>)}
    <label className="block"><span className={adminLabelClass}>Image description</span><input name="alt" defaultValue={photo?.alt} required maxLength={200} className={adminInputClass} /></label>
    <label className="block"><span className={adminLabelClass}>Display order</span><input name="position" type="number" defaultValue={photo?.position ?? 1} required min="1" max="999" className={adminInputClass} /></label>
    <label className="block"><span className={adminLabelClass}>Visibility</span><select name="status" defaultValue={photo?.status ?? "draft"} className={adminInputClass}><option value="draft">Draft</option><option value="published">Published</option></select></label>
    <label className="block sm:col-span-2"><span className={adminLabelClass}>{photo ? "Replace image (optional)" : "Store image"}</span><input name="image" type="file" accept="image/jpeg,image/png,image/webp" required={!photo} className={adminFileInputClass} /></label>
    {photo && <div className="relative aspect-[4/3] max-w-xs overflow-hidden rounded-xl bg-surface-2 sm:col-span-2"><Image src={franchiseImage(photo)} alt={photo.alt} fill unoptimized sizes="320px" {...imageLoading("visible")} className="object-contain" /></div>}
  </>;
}
