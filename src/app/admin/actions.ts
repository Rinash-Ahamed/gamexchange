"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin, clearAdminSession } from "@/lib/admin/auth";
import {
  createInventoryItem,
  CategoryError,
  createServiceRecord,
  deleteInventoryItem,
  isDuplicateSkuError,
  updateInventoryItem,
  updateServiceRecord,
} from "@/lib/admin/db";
import { inventoryStatuses, serviceStatuses } from "@/lib/admin/types";
import { InventoryImageError, removeInventoryImage, uploadInventoryImage } from "@/lib/admin/inventory-images";
import { formFile, formText, formTextFields } from "@/lib/admin/form-data";
import { refreshAdminData } from "@/lib/admin/revalidate";

const requiredText = z.string().trim().min(1).max(160);
const money = z.coerce.number().int().min(0).max(10_000_000);
const count = z.coerce.number().int().min(0).max(100_000);

const inventoryCreateSchema = z.object({
  sku: requiredText.transform((value) => value.toUpperCase()),
  name: requiredText,
  platform: requiredText,
  categoryId: z.string().regex(/^[a-zA-Z0-9-]{1,128}$/),
  condition: requiredText,
  stock: count,
  price: money,
  featured: z.boolean(),
  status: z.enum(inventoryStatuses),
});

const documentId = z.string().trim().min(1).max(128).refine((id) => !id.includes("/"));
const inventoryUpdateSchema = inventoryCreateSchema.extend({ id: documentId });

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
    ...formTextFields(formData, ["sku", "name", "platform", "categoryId", "condition", "stock", "price", "status"]),
    featured: formData.get("featured") === "on",
  };
}

function handleInventoryError(error: unknown): never {
  if (error instanceof CategoryError) redirect("/admin/inventory?error=category");
  if (error instanceof InventoryImageError) redirect(`/admin/inventory?error=${error.code}`);
  if (isDuplicateSkuError(error)) redirect("/admin/inventory?error=duplicate");
  throw error;
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function createInventoryAction(formData: FormData) {
  await requireAdmin();
  const parsed = inventoryCreateSchema.safeParse(inventoryFields(formData));
  if (!parsed.success) redirect("/admin/inventory?error=invalid");

  const file = formFile(formData, "image");
  if (!file) redirect("/admin/inventory?error=image");
  let uploaded: Awaited<ReturnType<typeof uploadInventoryImage>> | undefined;
  try {
    uploaded = await uploadInventoryImage(file);
    await createInventoryItem({ ...parsed.data, ...uploaded, tradeInVoucher: 0, tradeInCash: 0 });
  } catch (error) {
    await removeInventoryImage(uploaded?.imageStoragePath);
    handleInventoryError(error);
  }
  refreshAdminData("inventory");
  redirect(`/admin/inventory?notice=created&saved=${Date.now()}#inventory-list`);
}

export async function updateInventoryAction(formData: FormData) {
  await requireAdmin();
  const parsed = inventoryUpdateSchema.safeParse({
    ...inventoryFields(formData),
    id: formText(formData, "id"),
  });
  if (!parsed.success) redirect("/admin/inventory?error=invalid");
  const file = formFile(formData, "image");
  let uploaded: Awaited<ReturnType<typeof uploadInventoryImage>> | undefined;
  try {
    if (file) uploaded = await uploadInventoryImage(file);
    const { id, ...fields } = parsed.data;
    const previousPath = await updateInventoryItem(id, { ...fields, ...uploaded });
    await removeInventoryImage(previousPath);
  } catch (error) {
    await removeInventoryImage(uploaded?.imageStoragePath);
    handleInventoryError(error);
  }
  refreshAdminData("inventory");
  redirect(`/admin/inventory?notice=updated&saved=${Date.now()}#inventory-list`);
}

export async function deleteInventoryAction(formData: FormData) {
  await requireAdmin();
  const id = formText(formData, "id");
  if (!documentId.safeParse(id).success) redirect("/admin/inventory?error=invalid");
  const previousPath = await deleteInventoryItem(id);
  await removeInventoryImage(previousPath);
  refreshAdminData("inventory");
  redirect("/admin/inventory?notice=deleted");
}

export async function createServiceAction(formData: FormData) {
  await requireAdmin();
  const parsed = serviceCreateSchema.safeParse(formTextFields(formData,
    ["customerName", "phone", "device", "issue", "status", "estimatedCost", "notes"]));
  if (!parsed.success) redirect("/admin/services?error=invalid");
  const ticket = await createServiceRecord(parsed.data);
  refreshAdminData("services");
  redirect(`/admin/services?notice=created&ticket=${encodeURIComponent(ticket)}`);
}

export async function updateServiceAction(formData: FormData) {
  await requireAdmin();
  const parsed = serviceUpdateSchema.safeParse(formTextFields(formData, ["id", "status", "estimatedCost", "notes"]));
  if (!parsed.success) redirect("/admin/services?error=invalid");
  await updateServiceRecord(parsed.data.id, parsed.data);
  refreshAdminData("services");
  redirect("/admin/services?notice=updated");
}
