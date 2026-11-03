import Image from "next/image";
import { MapPin } from "lucide-react";
import { publicFranchisePhotos, franchiseImage } from "@/lib/admin/franchise";
import { imageLoading } from "@/lib/image-loading";
import { LightCard } from "@/components/ui/LightCard";
export async function FranchiseGallery() {
  const photos = await publicFranchisePhotos();
  if (!photos.length) return <p className="text-sm text-muted">Store photos will be shared here soon.</p>;
  return <div className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
    {photos.map((photo) => <LightCard key={photo.id} className="franchise-gallery-card min-w-0 rounded-2xl border border-line-strong bg-surface">
      <figure className="flex h-full flex-col">
        <div className="relative aspect-[4/5] w-full shrink-0 bg-surface-2">
          <div className="absolute inset-3">
            <Image src={franchiseImage(photo)} alt={photo.alt} fill sizes="(min-width: 1280px) 366px, (min-width: 1024px) 30vw, (min-width: 640px) 46vw, 100vw" {...imageLoading(photo.src === "/franchise/kovai-pudur.webp" ? "visible" : "deferred")} className="franchise-gallery-image object-contain" />
          </div>
        </div>
        <figcaption className="flex min-h-24 flex-1 items-start gap-2 border-t border-line px-4 py-4 text-sm"><MapPin className="mt-1 size-4 shrink-0 text-accent-text" aria-hidden /><div className="min-w-0 break-words"><p className="font-semibold leading-6">{photo.location || photo.title}</p>{photo.city && <p className="mt-1 text-xs leading-5 text-muted">{photo.city}{photo.state ? `, ${photo.state}` : ""}</p>}</div></figcaption>
      </figure>
    </LightCard>)}
  </div>;
}
