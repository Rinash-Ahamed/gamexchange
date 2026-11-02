import "server-only";
import { randomUUID } from "node:crypto";
import { firebaseStorageBucket } from "@/lib/firebase/storage";

/** Shared validated artwork upload, preserving aspect ratio and removing metadata. */
export async function uploadCardImage(file: File, prefix: "franchise-images") {
  if (!file.size || file.size > 5 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Choose a static JPG, PNG or WebP up to 5 MB.");
  let output;
  try {
    const { default: sharp } = await import("sharp");
    const input = sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 16_777_216, failOn: "warning" });
    const meta = await input.metadata();
    if (!meta.width || !meta.height || Math.min(meta.width, meta.height) < 300 || Math.max(meta.width, meta.height) > 4096 || (meta.pages ?? 1) !== 1 || !["jpeg", "png", "webp"].includes(meta.format ?? "")) throw new Error();
    output = await input.rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).webp({ quality: 85 }).toBuffer({ resolveWithObject: true });
  } catch { throw new Error("Use a static image with each side between 300 and 4096 px."); }
  const version = randomUUID();
  const path = `${prefix}/${version}.webp`;
  try {
    await firebaseStorageBucket(() => new Error("Storage is not configured.")).file(path).save(output.data, { resumable: false, contentType: "image/webp", metadata: { cacheControl: "private, no-store" } });
  } catch { throw new Error("Upload failed. Check the Storage bucket and service-account permissions."); }
  return { storagePath: path, version, width: output.info.width, height: output.info.height };
}
