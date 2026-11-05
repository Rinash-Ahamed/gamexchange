import "server-only";
import { randomUUID } from "node:crypto";
import { firebaseStorageBucket } from "@/lib/firebase/storage";
import { processCardImage, supportedCardImage } from "./process-card-image";

/** Shared validated artwork upload, preserving aspect ratio and removing metadata. */
export async function uploadCardImage(file: File, prefix: "franchise-images") {
  if (!supportedCardImage(file)) throw new Error("Choose a static JPG, PNG or WebP up to 5 MB.");
  let output;
  try {
    output = await processCardImage(file);
  } catch { throw new Error("Use a static image with each side between 300 and 4096 px."); }
  const version = randomUUID();
  const path = `${prefix}/${version}.webp`;
  try {
    await firebaseStorageBucket(() => new Error("Image uploads are unavailable. Please contact support.")).file(path).save(output.data, { resumable: false, contentType: "image/webp", metadata: { cacheControl: "private, no-store" } });
  } catch { throw new Error("Image upload failed. Please try again or contact support if the problem continues."); }
  return { storagePath: path, version, width: output.info.width, height: output.info.height };
}
