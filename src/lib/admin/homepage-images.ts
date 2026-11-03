import "server-only";
import { randomUUID } from "node:crypto";
import { unstable_cache } from "next/cache";
import { homepageImageSlots } from "@/data/homepage-images";
import { firebaseFirestore } from "@/lib/firebase/firestore";
import { firebaseStorageBucket } from "@/lib/firebase/storage";
import { createByteCache } from "@/lib/byte-cache";

type ImageAsset = { path: string; version: string; updatedAt: string };
const document = () => firebaseFirestore().collection("settings").doc("homepageImages");
const bucket = () => firebaseStorageBucket(() => new Error("Image uploads are unavailable. Please contact support."));
const ownedPath = /^homepage-images\/[a-f0-9-]+\.webp$/;
const cache = createByteCache(8 * 1024 * 1024);
export const HOMEPAGE_IMAGES_TAG = "homepage-images";
export const imageSlot = (id: string) => homepageImageSlots.find((slot) => slot.id === id);
export const homepageAssetUrl = (id: string, asset?: ImageAsset) => asset ? `/api/homepage-images/${id}?v=${encodeURIComponent(asset.version)}` : imageSlot(id)?.image ?? "";

export async function readHomepageImageAssets(): Promise<Record<string, ImageAsset>> {
  const snapshot = await document().get();
  const raw = snapshot.data()?.images ?? {};
  return Object.fromEntries(homepageImageSlots.flatMap(({ id }) => {
    const asset = raw[id] as ImageAsset | undefined;
    return asset && ownedPath.test(asset.path ?? "") && typeof asset.version === "string" ? [[id, asset]] : [];
  }));
}
export const publicHomepageImages = unstable_cache(async () => {
  const project = process.env.FIREBASE_PROJECT_ID?.trim();
  if (!project || project === "your-firebase-project-id") return {};
  const assets = await readHomepageImageAssets();
  return Object.fromEntries(Object.entries(assets).map(([id, asset]) => [id, homepageAssetUrl(id, asset)]));
}, ["homepage-images-v1", process.env.FIREBASE_PROJECT_ID ?? "demo", process.env.FIREBASE_DATABASE_ID ?? "(default)"], { tags: [HOMEPAGE_IMAGES_TAG], revalidate: 60 });

async function removeAsset(path?: string) {
  if (!path || !ownedPath.test(path)) return;
  cache.remove(path);
  try { await bucket().file(path).delete({ ignoreNotFound: true }); }
  catch { console.warn("Unused homepage artwork cleanup deferred."); }
}
export async function saveHomepageImage(id: string, file: File | undefined, reset: boolean) {
  if (!imageSlot(id)) throw new Error("Unknown image slot.");
  let uploaded: ImageAsset | undefined;
  if (!reset) {
    if (!file?.size || file.size > 5 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Choose a static JPG, PNG or WebP up to 5 MB.");
    let output;
    try {
      const { default: sharp } = await import("sharp");
      const input = sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 16_777_216, failOn: "warning" });
      const meta = await input.metadata();
      if (!meta.width || !meta.height || Math.min(meta.width, meta.height) < 300 || Math.max(meta.width, meta.height) > 4096 || (meta.pages ?? 1) !== 1 || !["jpeg", "png", "webp"].includes(meta.format ?? "")) throw new Error();
      output = await input.rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).webp({ quality: 85 }).toBuffer();
    } catch { throw new Error("Use a static image with each side between 300 and 4096 px."); }
    const version = randomUUID();
    uploaded = { path: `homepage-images/${version}.webp`, version, updatedAt: new Date().toISOString() };
    try { await bucket().file(uploaded.path).save(output, { resumable: false, contentType: "image/webp", metadata: { cacheControl: "private, no-store" } }); }
    catch { throw new Error("Image upload failed. Please try again or contact support if the problem continues."); }
  }
  let previous: ImageAsset | undefined;
  try {
    await firebaseFirestore().runTransaction(async (transaction) => {
      const snapshot = await transaction.get(document());
      const images = { ...(snapshot.data()?.images ?? {}) };
      previous = images[id];
      if (uploaded) images[id] = uploaded;
      else delete images[id];
      transaction.set(document(), { images, updatedAt: new Date().toISOString() });
    });
  } catch {
    await removeAsset(uploaded?.path);
    throw new Error("Could not save the image. Please try again.");
  }
  await removeAsset(previous?.path);
}
export async function readHomepageAsset(asset: ImageAsset) {
  if (!ownedPath.test(asset.path)) throw new Error("Invalid image path.");
  return cache.read(asset.path, async () => (await bucket().file(asset.path).download())[0]);
}
