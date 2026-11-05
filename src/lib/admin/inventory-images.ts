import "server-only";

import { randomUUID } from "node:crypto";
import { firebaseStorageBucket } from "@/lib/firebase/storage";
import { createByteCache } from "@/lib/byte-cache";
import type { InventoryPhoto } from "./types";
import { processCardImage, supportedCardImage } from "./process-card-image";

export class InventoryImageError extends Error {
  constructor(public readonly code: "image" | "storage") { super(code); }
}

function bucket() {
  return firebaseStorageBucket(() => new InventoryImageError("storage"));
}

const ownedPath = /^inventory-images\/[a-f0-9-]+\.webp$/;

export async function uploadInventoryImage(file: File) {
  if (!supportedCardImage(file)) {
    throw new InventoryImageError("image");
  }
  let image;
  try {
    image = await processCardImage(file);
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

export async function readInventoryImage(item: InventoryPhoto): Promise<Buffer> {
  const path = item.imageStoragePath;
  if (!path || !ownedPath.test(path)) throw new Error("Invalid inventory image");
  return cache.read(path, async () => {
    const [data] = await bucket().file(path).download();
    return data;
  });
}
