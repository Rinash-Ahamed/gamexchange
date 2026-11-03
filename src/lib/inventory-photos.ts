import type { InventoryPhoto } from "@/lib/admin/types";

export const MAX_INVENTORY_PHOTOS = 5;
// Leave room for multipart fields under serverless request-body limits.
export const INVENTORY_UPLOAD_BYTES = 4 * 1024 * 1024;
export function inventoryPhotos(item: InventoryPhoto & { images?: InventoryPhoto[] }): InventoryPhoto[] {
  return item.images?.length ? item.images.slice(0, MAX_INVENTORY_PHOTOS) : item.imageSrc || item.imageStoragePath ? [{ imageSrc: item.imageSrc, imageWidth: item.imageWidth, imageHeight: item.imageHeight, ...(item.imageStoragePath ? { imageStoragePath: item.imageStoragePath } : {}), ...(item.imageVersion ? { imageVersion: item.imageVersion } : {}) }] : [];
}
export const inventoryPhotoKey = (photo: InventoryPhoto, index: number) => `existing:${photo.imageVersion ?? index}`;
export const inventoryPhotoSource = (id: string, photo: InventoryPhoto) => photo.imageStoragePath && photo.imageVersion ? `/api/inventory/${id}/image?v=${encodeURIComponent(photo.imageVersion)}` : photo.imageSrc;

/** References can only retain this item's photos or select this request's files. */
export function inventoryPhotoOrder(value: unknown, existing: InventoryPhoto[], fileCount: number): string[] | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > MAX_INVENTORY_PHOTOS || value.some((key) => typeof key !== "string") || new Set(value).size !== value.length) return null;
  const allowed = new Set([...existing.map(inventoryPhotoKey), ...Array.from({ length: fileCount }, (_, index) => `new:${index}`)]);
  return value.every((key) => allowed.has(key)) ? value : null;
}
