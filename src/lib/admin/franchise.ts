import "server-only";
import { randomUUID } from "node:crypto";
import { unstable_cache } from "next/cache";
import { z } from "zod";
import { franchisePhotos } from "@/data/franchise";
import { firebaseFirestore as db } from "@/lib/firebase/firestore";
import { firebaseStorageBucket } from "@/lib/firebase/storage";
import { createByteCache } from "@/lib/byte-cache";
import { uploadCardImage } from "./card-image-upload";
export const FRANCHISE_TAG = "franchise-photos";
export const franchiseId = z.string().regex(/^[a-zA-Z0-9-]{1,80}$/);
export const franchiseFields = z.object({
  city: z.string().trim().min(1).max(100), state: z.string().trim().min(1).max(100),
  location: z.string().trim().min(1).max(180), alt: z.string().trim().min(1).max(200),
  position: z.coerce.number().int().min(1).max(999), status: z.enum(["draft", "published"]),
});
type Fields = z.infer<typeof franchiseFields>;
export type FranchisePhoto = Fields & { id: string; title: string; src: string; width: number; height: number; storagePath: string; version: string };
const collection = () => db().collection("franchisePhotos");
const marker = () => db().collection("settings").doc("franchisePhotos");
const owned = /^franchise-images\/[a-f0-9-]+\.webp$/;
const bytes = createByteCache(8 * 1024 * 1024);
const defaults: FranchisePhoto[] = franchisePhotos.map((photo, index) => ({
  ...photo, id: `original-${index + 1}`, city: "", state: "", location: "", position: index + 1,
  status: "published", storagePath: "", version: `original-${index + 1}`,
}));
export function franchiseImage(photo: FranchisePhoto) { return photo.storagePath ? `/api/franchise/${photo.id}/image?v=${encodeURIComponent(photo.version)}` : photo.src; }
async function initialize() {
  await db().runTransaction(async (transaction) => {
    if ((await transaction.get(marker())).exists) return;
    const existing = await transaction.get(collection().limit(1));
    if (existing.empty) defaults.forEach((photo) => { const { id, ...data } = photo; transaction.set(collection().doc(id), data); });
    transaction.set(marker(), { initialized: true });
  });
}
const sorted = (photos: FranchisePhoto[]) => photos.sort((a, b) => a.position - b.position || a.id.localeCompare(b.id));
export async function adminFranchisePhotos() {
  await initialize();
  return sorted((await collection().get()).docs.map((doc) => ({ ...doc.data(), id: doc.id }) as FranchisePhoto));
}
export const publicFranchisePhotos = unstable_cache(async () => {
  const project = process.env.FIREBASE_PROJECT_ID?.trim();
  if (!project || project === "your-firebase-project-id") return defaults;
  if (!(await marker().get()).exists) return defaults;
  return sorted((await collection().where("status", "==", "published").get()).docs.map((doc) => ({ ...doc.data(), id: doc.id }) as FranchisePhoto));
}, ["franchise-photos-v1", process.env.FIREBASE_PROJECT_ID ?? "demo", process.env.FIREBASE_DATABASE_ID ?? "(default)"], { revalidate: 60, tags: [FRANCHISE_TAG] });
export async function getFranchisePhoto(id: string) {
  if (!franchiseId.safeParse(id).success) return null;
  const photo = await collection().doc(id).get();
  return photo.exists ? { ...photo.data(), id: photo.id } as FranchisePhoto : null;
}
async function cleanup(path?: string) {
  if (!path || !owned.test(path)) return;
  bytes.remove(path);
  try { await firebaseStorageBucket(() => new Error("Storage not configured.")).file(path).delete({ ignoreNotFound: true }); }
  catch { console.warn("Unused franchise image cleanup deferred."); }
}
export async function saveFranchisePhoto(id: string | undefined, fields: Fields, file?: File) {
  await initialize();
  const image = file ? await uploadCardImage(file, "franchise-images") : undefined;
  let oldPath: string | undefined;
  try {
    await db().runTransaction(async (transaction) => {
      const ref = collection().doc(id ?? randomUUID());
      const previous = id ? await transaction.get(ref) : undefined;
      if (id && !previous?.exists) throw new Error("This photo no longer exists. Refresh the page.");
      if (!id) {
        const existing = await transaction.get(collection());
        if (existing.size >= 50) throw new Error("Keep up to 50 franchise photos. Remove an unused photo first.");
      }
      const prior = previous?.data();
      if (!prior && !image) throw new Error("Choose an image for this new location.");
      oldPath = image ? prior?.storagePath : undefined;
      transaction.set(ref, {
        ...(prior ?? {}), ...fields, title: `${fields.location}, ${fields.city}`,
        ...(image ?? {}), src: image ? "" : prior?.src ?? "",
      });
    });
  } catch (error) { await cleanup(image?.storagePath); throw error; }
  await cleanup(oldPath);
}
export async function deleteFranchisePhoto(id: string) {
  let path: string | undefined;
  await db().runTransaction(async (transaction) => {
    const ref = collection().doc(id);
    const photo = await transaction.get(ref);
    if (!photo.exists) throw new Error("Photo not found.");
    path = photo.data()?.storagePath;
    transaction.delete(ref);
  });
  await cleanup(path);
}
export async function franchiseImageBytes(photo: FranchisePhoto) {
  if (!owned.test(photo.storagePath)) throw new Error("Invalid image.");
  return bytes.read(photo.storagePath, async () => (await firebaseStorageBucket(() => new Error("Storage not configured.")).file(photo.storagePath).download())[0]);
}
