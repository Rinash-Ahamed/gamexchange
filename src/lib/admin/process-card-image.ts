import "server-only";

/** Shared decoding policy for inventory, franchise and homepage card artwork. */
export function supportedCardImage(file: File) {
  return file.size > 0 && file.size <= 5 * 1024 * 1024 && ["image/jpeg", "image/png", "image/webp"].includes(file.type);
}

export async function processCardImage(file: File) {
  const { default: sharp } = await import("sharp");
  const input = sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 16_777_216, failOn: "warning" });
  const metadata = await input.metadata();
  if (!metadata.width || !metadata.height || Math.min(metadata.width, metadata.height) < 300 ||
    Math.max(metadata.width, metadata.height) > 4096 || (metadata.pages ?? 1) !== 1 ||
    !["jpeg", "png", "webp"].includes(metadata.format ?? "")) throw new Error("Invalid image");
  return input.rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 85 }).toBuffer({ resolveWithObject: true });
}
