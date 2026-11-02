import Image from "next/image";
import { MapPin } from "lucide-react";
import { publicFranchisePhotos, franchiseImage } from "@/lib/admin/franchise";
import { imageLoading } from "@/lib/image-loading";
export async function FranchiseGallery() {
  const photos = await publicFranchisePhotos();
  if (!photos.length) return <p className="text-sm text-muted">Store photos will be shared here soon.</p>;
  return <div className="grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
    {photos.map((photo) => <figure key={photo.id} className="min-w-0 overflow-hidden rounded-2xl border border-line-strong bg-surface">
      <Image src={franchiseImage(photo)} alt={photo.alt} width={photo.width} height={photo.height} sizes="(min-width: 1280px) 390px, (min-width: 1024px) 30vw, (min-width: 640px) 46vw, 100vw" {...imageLoading(photo.src === "/franchise/kovai-pudur.webp" ? "visible" : "deferred")} className="h-auto w-full" />
      <figcaption className="flex min-h-16 items-start gap-2 border-t border-line px-4 py-3 text-sm"><MapPin className="mt-1 size-4 shrink-0 text-accent-text" aria-hidden /><div className="min-w-0 break-words"><p className="font-semibold">{photo.location || photo.title}</p>{photo.city && <p className="mt-1 text-xs text-muted">{photo.city}{photo.state ? `, ${photo.state}` : ""}</p>}</div></figcaption>
    </figure>)}
  </div>;
}
