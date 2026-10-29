import "server-only";

import { randomUUID } from "node:crypto";
import { firebaseStorageBucket } from "@/lib/firebase/storage";
import { createByteCache } from "@/lib/byte-cache";
import type { InventoryItem } from "./types";

export class InventoryImageError extends Error {
  constructor(public readonly code: "image" | "storage") { super(code); }
}

function bucket() {
  return firebaseStorageBucket(() => new InventoryImageError("storage"));
}

const ownedPath = /^inventory-images\/[a-f0-9-]+\.webp$/;

export async function uploadInventoryImage(file: File) {
  if (!file.size || file.size > 5 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new InventoryImageError("image");
  }
  let image;
  try {
    const { default: sharp } = await import("sharp");
    const input = sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 16_777_216, failOn: "warning" });
    const metadata = await input.metadata();
    if (!metadata.width || !metadata.height || Math.min(metadata.width, metadata.height) < 300 ||
      Math.max(metadata.width, metadata.height) > 4096 || (metadata.pages ?? 1) !== 1 ||
      !["jpeg", "png", "webp"].includes(metadata.format ?? "")) throw new Error("Invalid image");
    image = await input.rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 85 }).toBuffer({ resolveWithObject: true });
  } catch { throw new InventoryImageError("image"); }
  const imageVersion = randomUUID();
  const imageStoragePath = `inventory-images/${imageVersion}.webp`;
  try {
    await bucket().file(imageStoragePath).save(image.data, {
      resumable: false, contentType: "image/webp", metadata: { cacheControl: "private, no-store" },
    });
  } catch { throw new InventoryImageError("storage"); }
  return { imageSrc: "", imageWidth: image.info.width, imageHeight: image.info.height, imageStoragePath, imageVersion };
}

export async function removeInventoryImage(path?: string) {
  if (!path || !ownedPath.test(path)) return;
  try { await bucket().file(path).delete({ ignoreNotFound: true }); }
  catch { console.warn("Could not remove an unused inventory image from Storage."); }
  cache.remove(path);
}

// Bounded cache stores only immutable bytes. Authorization is checked by the route on every request.
const cache = createByteCache(8 * 1024 * 1024);

export async function readInventoryImage(item: InventoryItem): Promise<Buffer> {
  const path = item.imageStoragePath;
  if (!path || !ownedPath.test(path)) throw new Error("Invalid inventory image");
  return cache.read(path, async () => {
    const [data] = await bucket().file(path).download();
    return data;
  });
}
