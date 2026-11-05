"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Trash2 } from "lucide-react";
import { adminFileInputClass, adminLabelClass, adminGhostButtonClass } from "./styles";
import type { InventoryItem } from "@/lib/admin/types";
import { inventoryPhotoKey, inventoryPhotos, inventoryPhotoSource, INVENTORY_UPLOAD_BYTES, MAX_INVENTORY_PHOTOS } from "@/lib/inventory-photos";
import { validateInventoryPhoto } from "@/lib/inventory-photo-validation";

type Preview = { key: string; src: string };

export function InventoryImageField({ item }: { item?: InventoryItem }) {
  const [photos, setPhotos] = useState<Preview[]>(() => item ? inventoryPhotos(item).map((photo, index) => ({ key: inventoryPhotoKey(photo, index), src: inventoryPhotoSource(item.id, photo) })) : []);
  const [error, setError] = useState("");
  const hintId = useId();
  const urls = useRef(new Set<string>());
  const selection = useRef(0);
  useEffect(() => { const owned = urls.current; return () => { owned.forEach((url) => URL.revokeObjectURL(url)); }; }, []);
  function move(index: number, target: number) {
    setPhotos((previous) => {
      const next = [...previous];
      const [photo] = next.splice(index, 1);
      if (photo) next.splice(target, 0, photo);
      return next;
    });
  }
  return (
    <div className="sm:col-span-2 lg:col-span-4">
      <input type="hidden" name="imageOrder" value={JSON.stringify(photos.map((photo) => photo.key))} />
      <label><span className={adminLabelClass}>Product images ({photos.length}/{MAX_INVENTORY_PHOTOS})</span>
        <input name="image" type="file" multiple accept="image/jpeg,image/png,image/webp" required={!item && !photos.length}
          aria-describedby={hintId} className={adminFileInputClass} onChange={async (event) => {
            const input = event.currentTarget;
            const attempt = ++selection.current;
            const files = Array.from(event.target.files ?? []);
            const retained = photos.filter((photo) => photo.key.startsWith("existing:"));
            const invalid = retained.length + files.length > MAX_INVENTORY_PHOTOS || files.reduce((sum, file) => sum + file.size, 0) > INVENTORY_UPLOAD_BYTES || files.some((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type));
            let message = invalid ? "Keep up to 5 photos. New files must be JPG, PNG or WebP, up to 4 MB combined. Remove a photo before adding its replacement if all slots are full." : "";
            input.setCustomValidity("Please wait while the selected images are checked.");
            setError("Checking selected images...");
            if (!invalid) {
              try { for (const file of files) await validateInventoryPhoto(file); }
              catch (error) { message = error instanceof Error ? error.message : "Choose a valid JPG, PNG or WebP image."; }
            }
            if (attempt !== selection.current || !input.isConnected) return;
            input.setCustomValidity(message); setError(message);
            if (message) input.value = "";
            urls.current.forEach((url) => URL.revokeObjectURL(url)); urls.current.clear();
            const selected = message ? [] : files.map((file, index) => {
              const src = URL.createObjectURL(file); urls.current.add(src);
              return { key: `new:${index}`, src };
            });
            setPhotos([...retained, ...selected]);
          }} />
      </label>
      <p id={hintId} className="mt-2 text-xs leading-5 text-muted">Up to 5 photos. JPG, PNG or WebP, 300 to 4096 px per side; new files up to 4 MB combined per save. First image is the cover. Choose multiple files together; choosing again replaces unsaved selections. Changes apply when you save the item.</p>
      <p className="mt-1 text-xs leading-5 text-muted">Portrait, square and landscape photos fit inside the same shop-card frame without cropping. Keep the product centred with minimal empty space around it.</p>
      {error && <p role="alert" className="mt-2 text-xs text-danger">{error}</p>}
      <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {photos.map((photo, index) => <li key={photo.key} className="min-w-0 rounded-xl border border-line-strong bg-surface p-2">
          <div className="flex aspect-square items-center justify-center rounded-lg bg-surface-2 p-2">
            {/* Native images support local blob previews and authenticated drafts. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.src} alt={`Product photo ${index + 1} preview`} className="max-h-full max-w-full object-contain" />
          </div>
          <button type="button" disabled={index === 0} onClick={() => move(index, 0)} className={`${adminGhostButtonClass} mt-2 w-full disabled:opacity-60`}>{index === 0 ? "Cover image" : "Set as cover"}</button>
          <div className="mt-2 flex flex-wrap justify-between gap-1">
            <button type="button" disabled={index === 0} onClick={() => move(index, index - 1)} aria-label={`Move photo ${index + 1} earlier`} className="grid size-9 place-items-center rounded-lg border border-line-strong disabled:opacity-30"><ArrowLeft className="size-4" aria-hidden /></button>
            <button type="button" disabled={index === photos.length - 1} onClick={() => move(index, index + 1)} aria-label={`Move photo ${index + 1} later`} className="grid size-9 place-items-center rounded-lg border border-line-strong disabled:opacity-30"><ArrowRight className="size-4" aria-hidden /></button>
            <button type="button" onClick={() => setPhotos((previous) => previous.filter((entry) => entry.key !== photo.key))} aria-label={`Remove photo ${index + 1} from this edit`} className="grid size-9 place-items-center rounded-lg border border-line-strong text-danger"><Trash2 className="size-4" aria-hidden /></button>
          </div>
        </li>)}
      </ul>
      {!photos.length && <p className="mt-2 text-xs text-muted">Add at least one product photo before saving.</p>}
    </div>
  );
}
