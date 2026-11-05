"use server";
import { recordPageFormLocation, recordPageHref } from "@/lib/admin/record-cursor";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin, clearAdminSession } from "@/lib/admin/auth";
import {
  createInventoryItem,
  getInventoryItem,
  CategoryError,
  InventoryConflictError,
  createServiceRecord,
  deleteInventoryItem,
  isDuplicateSkuError,
  updateInventoryItem,
  updateServiceRecord,
} from "@/lib/admin/db";
import { inventoryStatuses, serviceStatuses, type InventoryPhoto } from "@/lib/admin/types";
import { InventoryImageError, removeInventoryImage } from "@/lib/admin/inventory-images";
import { prepareInventoryGallery } from "@/lib/admin/inventory-gallery";
import { formText, formTextFields } from "@/lib/admin/form-data";
import { refreshAdminData } from "@/lib/admin/revalidate";
import { normalizePlatform, playModeChoices } from "@/data/catalog";
import { discountedPrice } from "@/lib/pricing";

const requiredText = z.string().trim().min(1).max(160);
const money = z.coerce.number<string>().int().min(0).max(10_000_000);
const count = z.coerce.number().int().min(0).max(100_000);

const inventoryFieldsSchema = z.object({
  sku: requiredText.transform((value) => value.toUpperCase()),
  name: requiredText,
  platform: requiredText.transform(normalizePlatform),
  shopSection: z.enum(["games", "consoles", "accessories"]),
  genre: z.string().trim().max(80),
  brand: z.string().trim().max(80),
  playModes: z.array(z.enum(playModeChoices)).max(playModeChoices.length).transform((modes) => [...new Set(modes)]),
  ageRating: z.string().trim().max(40),
  releaseYear: z.coerce.number().int().refine((year) => year === 0 || (year >= 1970 && year <= 2100)),
  format: z.enum(["", "Disc", "Cartridge"]),
  edition: z.string().trim().max(80),
  description: z.string().trim().max(1000),
  basePrice: z.string().trim().min(1).pipe(money),
  discountPercent: z.coerce.number().min(0).max(100),
  categoryId: z.string().regex(/^[a-zA-Z0-9-]{1,128}$/),
  condition: requiredText,
  stock: count,
  featured: z.boolean(),
  status: z.enum(inventoryStatuses),
});

const documentId = z.string().trim().min(1).max(128).refine((id) => !id.includes("/"));
const validPricing = (item: { basePrice: number; discountPercent: number }) => item.discountPercent === 0 || discountedPrice(item.basePrice, item.discountPercent) < item.basePrice;
function sellingPrice<T extends { basePrice: number; discountPercent: number }>(input: T) {
  const { basePrice, ...fields } = input;
  return { ...fields, price: discountedPrice(basePrice, input.discountPercent), originalPrice: input.discountPercent > 0 ? basePrice : 0 };
}
const inventoryCreateSchema = inventoryFieldsSchema.refine(validPricing, { message: "Discount must reduce the selling price.", path: ["discountPercent"] }).transform(sellingPrice);
const inventoryUpdateSchema = inventoryFieldsSchema.extend({ id: documentId, expectedUpdatedAt: z.iso.datetime() }).refine(validPricing, { path: ["discountPercent"] }).transform(sellingPrice);

const serviceCreateSchema = z.object({
  customerName: requiredText,
  phone: z.string().trim().min(7).max(24),
  device: requiredText,
  issue: z.string().trim().min(2).max(1_000),
  status: z.enum(serviceStatuses),
  estimatedCost: money,
  notes: z.string().trim().max(4_000),
});

const serviceUpdateSchema = z.object({
  id: documentId,
  status: z.enum(serviceStatuses),
  estimatedCost: money,
  notes: z.string().trim().max(4_000),
});

function inventoryFields(formData: FormData) {
  return {
    ...formTextFields(formData, ["sku", "name", "platform", "categoryId", "condition", "stock", "basePrice", "discountPercent", "status", "shopSection", "genre", "format", "edition", "description", "brand", "ageRating", "releaseYear"]),
    playModes: formData.getAll("playModes").map(String),
    featured: formData.get("featured") === "on",
  };
}

function handleInventoryError(error: unknown): never {
  if (error instanceof InventoryConflictError) redirect("/admin/inventory?error=conflict");
  if (error instanceof CategoryError) redirect("/admin/inventory?error=category");
  if (error instanceof InventoryImageError) redirect(`/admin/inventory?error=${error.code}`);
  if (isDuplicateSkuError(error)) redirect("/admin/inventory?error=duplicate");
  console.error("[admin] Inventory change could not be confirmed.");
  redirect("/admin/inventory?error=save");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function createInventoryAction(formData: FormData) {
  const actor = await requireAdmin();
  const parsed = inventoryCreateSchema.safeParse(inventoryFields(formData));
  if (!parsed.success) redirect("/admin/inventory?error=invalid");

  let uploaded: InventoryPhoto[] = [];
  try {
    const gallery = await prepareInventoryGallery(formData);
    uploaded = gallery.uploaded;
    await createInventoryItem({ ...parsed.data, ...gallery.fields, tradeInVoucher: 0, tradeInCash: 0 }, actor);
  } catch (error) {
    await cleanRejectedUploads(error, uploaded);
    handleInventoryError(error);
  }
  refreshAdminData("inventory");
  redirect(`/admin/inventory?notice=created&saved=${Date.now()}#inventory-list`);
}

export async function updateInventoryAction(formData: FormData) {
  const actor = await requireAdmin();
  const parsed = inventoryUpdateSchema.safeParse({
    ...inventoryFields(formData),
    id: formText(formData, "id"),
    expectedUpdatedAt: formText(formData, "expectedUpdatedAt"),
  });
  if (!parsed.success) redirect("/admin/inventory?error=invalid");
  let uploaded: InventoryPhoto[] = [];
  try {
    const { id, expectedUpdatedAt, ...fields } = parsed.data;
    const current = await getInventoryItem(id);
    if (!current || current.updatedAt !== expectedUpdatedAt) throw new InventoryConflictError();
    const gallery = await prepareInventoryGallery(formData, current);
    uploaded = gallery.uploaded;
    const previousPaths = await updateInventoryItem(id, { ...fields, ...gallery.fields }, expectedUpdatedAt, actor);
    await Promise.all(previousPaths.map((path) => removeInventoryImage(path)));
  } catch (error) {
    await cleanRejectedUploads(error, uploaded);
    handleInventoryError(error);
  }
  refreshAdminData("inventory");
  redirect(`/admin/inventory?notice=updated&saved=${Date.now()}#inventory-list`);
}

export async function deleteInventoryAction(formData: FormData) {
  const actor = await requireAdmin();
  const id = formText(formData, "id");
  if (!documentId.safeParse(id).success) redirect("/admin/inventory?error=invalid");
  try {
    const previousPaths = await deleteInventoryItem(id, actor);
    await Promise.all(previousPaths.map((path) => removeInventoryImage(path)));
  } catch (error) { handleInventoryError(error); }
  refreshAdminData("inventory");
  redirect(`/admin/inventory?notice=deleted&saved=${Date.now()}`);
}

async function cleanRejectedUploads(error: unknown, uploaded: InventoryPhoto[]) {
  // Only definite transaction rejection is safe to clean; an uncertain commit may reference these files.
  if (error instanceof InventoryConflictError || error instanceof CategoryError || isDuplicateSkuError(error)) {
    await Promise.all(uploaded.map((photo) => removeInventoryImage(photo.imageStoragePath)));
  } else if (uploaded.length) console.warn("Inventory save unconfirmed; uploaded images retained for review.");
}

export async function createServiceAction(formData: FormData) {
  const actor = await requireAdmin();
  const parsed = serviceCreateSchema.safeParse(formTextFields(formData,
    ["customerName", "phone", "device", "issue", "status", "estimatedCost", "notes"]));
  if (!parsed.success) redirect("/admin/services?error=invalid");
  let ticket: string;
  try { ticket = await createServiceRecord(parsed.data, actor); }
  catch {
    console.error("[admin] Service creation could not be confirmed.");
    redirect("/admin/services?error=save");
  }
  refreshAdminData("services");
  redirect(`/admin/services?notice=created&ticket=${encodeURIComponent(ticket)}&saved=${Date.now()}`);
}

export async function updateServiceAction(formData: FormData) {
  const actor = await requireAdmin();
  const location = recordPageFormLocation("services", formData);
  const parsed = serviceUpdateSchema.safeParse(formTextFields(formData, ["id", "status", "estimatedCost", "notes"]));
  if (!parsed.success) redirect(recordPageHref("services", location, { error: "invalid" }));
  try { await updateServiceRecord(parsed.data.id, parsed.data, actor); }
  catch {
    console.error("[admin] Service update could not be confirmed.");
    redirect(recordPageHref("services", location, { error: "save" }));
  }
  refreshAdminData("services");
  redirect(`${recordPageHref("services", location, { notice: "updated", saved: String(Date.now()) })}#service-list`);
}
