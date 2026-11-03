import "server-only";
import type { InventoryItem, InventoryPhoto } from "./types";
import { InventoryImageError, removeInventoryImage, uploadInventoryImage } from "./inventory-images";
import { inventoryPhotoKey, inventoryPhotoOrder, inventoryPhotos, INVENTORY_UPLOAD_BYTES, MAX_INVENTORY_PHOTOS } from "@/lib/inventory-photos";

export async function prepareInventoryGallery(form: FormData, current?: InventoryItem) {
  const files = form.getAll("image").filter((entry): entry is File => entry instanceof File && entry.size > 0);
  if (files.length > MAX_INVENTORY_PHOTOS || files.reduce((total, file) => total + file.size, 0) > INVENTORY_UPLOAD_BYTES) throw new InventoryImageError("image");
  let value: unknown;
  try { value = JSON.parse(String(form.get("imageOrder") ?? "[]")); }
  catch { throw new InventoryImageError("image"); }
  const original = current ? inventoryPhotos(current) : [];
  const order = inventoryPhotoOrder(value, original, files.length);
  if (!order) throw new InventoryImageError("image");
  const existing = new Map(original.map((photo, index) => [inventoryPhotoKey(photo, index), photo]));
  const uploaded: InventoryPhoto[] = [];
  try {
    const images: InventoryPhoto[] = [];
    for (const key of order) {
      const retained = existing.get(key);
      if (retained) images.push(retained);
      else {
        const photo = await uploadInventoryImage(files[Number(key.slice(4))]!);
        uploaded.push(photo); images.push(photo);
      }
    }
    const cover = images[0]!;
    return { uploaded, fields: { ...cover, imageStoragePath: cover.imageStoragePath ?? "", imageVersion: cover.imageVersion ?? "", images } };
  } catch (error) {
    await Promise.all(uploaded.map((photo) => removeInventoryImage(photo.imageStoragePath)));
    throw error;
  }
}
