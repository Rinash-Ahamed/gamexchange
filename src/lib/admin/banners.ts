import "server-only";

import { randomUUID } from "node:crypto";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { unstable_cache } from "next/cache";
import { PUBLIC_BANNERS_TAG } from "@/lib/public-cache";
import { z } from "zod";
import { firebaseAdminApp } from "@/lib/firebase/admin";
import { bannerImageRequirements as requirements, defaultBannerSlides, type BannerSlide } from "@/data/banners";

export type StoredBanner = Omit<BannerSlide, "image"> & {
  imageSrc: string;
  storagePath: string;
  width: number;
  height: number;
  version: string;
  position: number;
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
};
export type AdminBanner = StoredBanner & { image: string };

export class BannerError extends Error {}

export const bannerFieldsSchema = z.object({
  title: z.string().trim().min(1, "Enter a name for this banner.").max(100),
  headline: z.string().trim().max(70, "Keep the headline under 70 characters."),
  description: z.string().trim().max(180, "Keep the description under 180 characters."),
  alt: z.string().trim().min(1, "Describe the image for screen readers.").max(200),
  position: z.coerce.number().int().min(1).max(999),
  status: z.enum(["draft", "published"]),
});
export type BannerFields = z.infer<typeof bannerFieldsSchema>;
export const bannerIdSchema = z.string().regex(/^[a-zA-Z0-9-]{1,80}$/);

function db() {
  const id = process.env.FIREBASE_DATABASE_ID?.trim();
  return id ? getFirestore(firebaseAdminApp(), id) : getFirestore(firebaseAdminApp());
}
function collection() { return db().collection("homepageBanners"); }
function settings() { return db().collection("settings").doc("homepageBanners"); }
function bucket() {
  const name = process.env.FIREBASE_STORAGE_BUCKET?.trim();
  if (!name || name.startsWith("gs://") || name.includes("/")) throw new BannerError("Set FIREBASE_STORAGE_BUCKET to the bucket name from Firebase Storage, without gs://.");
  return getStorage(firebaseAdminApp()).bucket(name);
}

export function bannerStorageConfigured() { return Boolean(process.env.FIREBASE_STORAGE_BUCKET?.trim()); }
export function bannerImageSource(banner: StoredBanner) {
  return banner.storagePath ? `/api/banners/${banner.id}/image?v=${encodeURIComponent(banner.version)}` : banner.imageSrc;
}

/** Initialize only from the admin page, preserving the five existing slides. */
async function initializeBanners() {
  await db().runTransaction(async (transaction) => {
    if ((await transaction.get(settings())).exists) return;
    const now = new Date().toISOString();
    defaultBannerSlides.forEach((slide, index) => {
      const { image, ...rest } = slide;
      transaction.set(collection().doc(slide.id), {
        ...rest, imageSrc: image, storagePath: "", width: 1920, height: 840, version: slide.id,
        position: index + 1, status: "published", createdAt: now, updatedAt: now,
      } satisfies StoredBanner);
    });
    transaction.set(settings(), { initialized: true, updatedAt: now });
  });
}

function sortBanners(banners: StoredBanner[]) {
  return banners.sort((a, b) => a.position - b.position || a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
}

export async function listAdminBanners(): Promise<AdminBanner[]> {
  await initializeBanners();
  const snapshot = await collection().get();
  return sortBanners(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as StoredBanner))
    .map((banner) => ({ ...banner, image: bannerImageSource(banner) }));
}

async function readPublicBanners(): Promise<BannerSlide[]> {
  const project = process.env.FIREBASE_PROJECT_ID?.trim();
  if (!project || project === "your-firebase-project-id") return defaultBannerSlides;
  if (!(await settings().get()).exists) return defaultBannerSlides;
  const snapshot = await collection().where("status", "==", "published").get();
  return sortBanners(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as StoredBanner))
    .slice(0, requirements.maxPublished)
    .map((banner) => ({ id: banner.id, title: banner.title, headline: banner.headline, description: banner.description, alt: banner.alt, image: bannerImageSource(banner) }));
}

export const listPublicBanners = unstable_cache(readPublicBanners,
  ["public-banners-v1", process.env.FIREBASE_PROJECT_ID ?? "demo", process.env.FIREBASE_DATABASE_ID ?? "(default)"],
  { revalidate: 60, tags: [PUBLIC_BANNERS_TAG] });

export async function getStoredBanner(id: string): Promise<StoredBanner | null> {
  if (!bannerIdSchema.safeParse(id).success) return null;
  const document = await collection().doc(id).get();
  return document.exists ? { ...document.data(), id: document.id } as StoredBanner : null;
}

export async function prepareBannerImage(file: File) {
  if (file.size > requirements.maxBytes) throw new BannerError("Choose an image no larger than 5 MB.");
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new BannerError("Upload a JPG, PNG or WebP image.");
  try {
    const { default: sharp } = await import("sharp");
    const bytes = Buffer.from(await file.arrayBuffer());
    const image = sharp(bytes, { limitInputPixels: 8_000_000, failOn: "warning" });
    const metadata = await image.metadata();
    if (!["jpeg", "png", "webp"].includes(metadata.format ?? "") || (metadata.pages ?? 1) !== 1) {
      throw new BannerError("Use a static JPG, PNG or WebP image. Animated files are not supported.");
    }
    const rotated = (metadata.orientation ?? 0) >= 5;
    const width = (rotated ? metadata.height : metadata.width) ?? 0;
    const height = (rotated ? metadata.width : metadata.height) ?? 0;
    if (width < requirements.minWidth || height < requirements.minHeight || width > requirements.maxWidth || height > requirements.maxHeight) {
      throw new BannerError("Use at least 1280 × 560 px and at most 4096 × 1792 px. Recommended: 1920 × 840 px.");
    }
    if (Math.abs(width / height / (16 / 7) - 1) > 0.02) throw new BannerError("Use a 16:7 landscape image, such as 1920 × 840 px. Crop your artwork before uploading.");
    return await image.rotate().resize(1920, 840, { fit: "cover", withoutEnlargement: true }).webp({ quality: 85 }).toBuffer({ resolveWithObject: true });
  } catch (error) {
    if (error instanceof BannerError) throw error;
    throw new BannerError("This image could not be read. Export it again as JPG, PNG or WebP.");
  }
}

async function removeImage(path: string) {
  if (!/^homepage-banners\/[a-f0-9-]+\.webp$/.test(path)) return;
  try { await bucket().file(path).delete({ ignoreNotFound: true }); }
  catch { console.warn("Banner image cleanup was deferred; remove unused objects from homepage-banners in Firebase Storage."); }
}

export async function saveBanner(id: string | undefined, fields: BannerFields, file?: File) {
  await initializeBanners();
  const bannerId = id ?? randomUUID();
  let uploaded: { storagePath: string; width: number; height: number; version: string } | undefined;
  if (file) {
    const output = await prepareBannerImage(file);
    const version = randomUUID();
    const storagePath = `homepage-banners/${version}.webp`;
    await bucket().file(storagePath).save(output.data, { resumable: false, contentType: "image/webp", metadata: { cacheControl: "private, max-age=0, no-store" } });
    uploaded = { storagePath, width: output.info.width, height: output.info.height, version };
  }
  try {
    const oldPath = await db().runTransaction(async (transaction) => {
      await transaction.get(settings());
      const snapshot = await transaction.get(collection());
      const existing = snapshot.docs.find((document) => document.id === bannerId)?.data() as StoredBanner | undefined;
      if (id && !existing) throw new BannerError("This banner no longer exists. Refresh the page.");
      if (!existing && snapshot.size >= requirements.maxSaved) throw new BannerError("You can save up to 20 banners. Delete an unused draft first.");
      if (!existing && !uploaded) throw new BannerError("Choose an image for the new banner.");
      if (fields.status === "published" && snapshot.docs.filter((document) => document.id !== bannerId && document.data().status === "published").length >= requirements.maxPublished) {
        throw new BannerError("Only five banners can be published. Save this as a draft or unpublish another banner first.");
      }
      const now = new Date().toISOString();
      const banner: StoredBanner = {
        ...fields, id: bannerId, imageSrc: uploaded ? "" : existing?.imageSrc ?? "",
        storagePath: uploaded?.storagePath ?? existing?.storagePath ?? "",
        width: uploaded?.width ?? existing?.width ?? 1920, height: uploaded?.height ?? existing?.height ?? 840,
        version: uploaded?.version ?? existing?.version ?? bannerId,
        createdAt: existing?.createdAt ?? now, updatedAt: now,
      };
      transaction.set(collection().doc(bannerId), banner);
      transaction.set(settings(), { initialized: true, updatedAt: now });
      return uploaded ? existing?.storagePath : undefined;
    });
    if (oldPath) await removeImage(oldPath);
    return bannerId;
  } catch (error) {
    if (uploaded) await removeImage(uploaded.storagePath);
    throw error;
  }
}

export async function deleteBanner(id: string) {
  const path = await db().runTransaction(async (transaction) => {
    await transaction.get(settings());
    const doc = await transaction.get(collection().doc(id));
    if (!doc.exists) throw new BannerError("This banner no longer exists.");
    transaction.delete(doc.ref);
    transaction.set(settings(), { initialized: true, updatedAt: new Date().toISOString() });
    return (doc.data() as StoredBanner).storagePath;
  });
  if (path) await removeImage(path);
}

const imageCache = new Map<string, Buffer>();
const imageLoads = new Map<string, Promise<Buffer>>();
const IMAGE_CACHE_LIMIT = 8 * 1024 * 1024;
let imageCacheBytes = 0;

/** Cache only immutable bytes; the route still checks current visibility and authorization. */
export async function readBannerImage(banner: StoredBanner) {
  if (!/^homepage-banners\/[a-f0-9-]+\.webp$/.test(banner.storagePath)) throw new BannerError("Invalid banner image.");
  const key = `${process.env.FIREBASE_STORAGE_BUCKET}:${banner.storagePath}`;
  const cached = imageCache.get(key);
  if (cached) {
    imageCache.delete(key); imageCache.set(key, cached);
    return cached;
  }
  const pending = imageLoads.get(key);
  if (pending) return pending;
  const load = bucket().file(banner.storagePath).download().then(([data]) => {
    if (data.length <= IMAGE_CACHE_LIMIT) {
      while (imageCacheBytes + data.length > IMAGE_CACHE_LIMIT) {
        const oldest = imageCache.keys().next().value;
        if (oldest === undefined) break;
        imageCacheBytes -= imageCache.get(oldest)!.length;
        imageCache.delete(oldest);
      }
      imageCache.set(key, data); imageCacheBytes += data.length;
    }
    return data;
  }).finally(() => imageLoads.delete(key));
  imageLoads.set(key, load);
  return load;
}
