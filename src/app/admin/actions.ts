"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin, clearAdminSession } from "@/lib/admin/auth";
import {
  createInventoryItem,
  createServiceRecord,
  deleteInventoryItem,
  isDuplicateSkuError,
  updateInventoryItem,
  updateServiceRecord,
} from "@/lib/admin/db";
import { inventoryStatuses, serviceStatuses } from "@/lib/admin/types";

const requiredText = z.string().trim().min(1).max(160);
const money = z.coerce.number().int().min(0).max(10_000_000);
const count = z.coerce.number().int().min(0).max(100_000);
const validImageSource = (value: string) => {
  if (value.startsWith("/")) return !value.startsWith("//");
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "framerusercontent.com";
  } catch {
    return false;
  }
};

const inventoryCreateSchema = z.object({
  sku: requiredText.transform((value) => value.toUpperCase()),
  name: requiredText,
  platform: requiredText,
  category: requiredText,
  condition: requiredText,
  stock: count,
  price: money,
  tradeInVoucher: money,
  tradeInCash: money,
  imageSrc: z.string().trim().min(1).max(2_000).refine(validImageSource, "Enter a local path or an approved image URL."),
  imageWidth: z.coerce.number().int().min(1).max(8_000).default(480),
  imageHeight: z.coerce.number().int().min(1).max(8_000).default(480),
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

const value = (formData: FormData, key: string) => String(formData.get(key) ?? "");

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function createInventoryAction(formData: FormData) {
  await requireAdmin();
  const parsed = inventoryCreateSchema.safeParse({
    sku: value(formData, "sku"),
    name: value(formData, "name"),
    platform: value(formData, "platform"),
    category: value(formData, "category"),
    condition: value(formData, "condition"),
    stock: value(formData, "stock"),
    price: value(formData, "price"),
    tradeInVoucher: value(formData, "tradeInVoucher"),
    tradeInCash: value(formData, "tradeInCash"),
    imageSrc: value(formData, "imageSrc"),
    imageWidth: value(formData, "imageWidth") || 480,
    imageHeight: value(formData, "imageHeight") || 480,
    featured: formData.get("featured") === "on",
    status: value(formData, "status"),
  });
  if (!parsed.success) redirect("/admin/inventory?error=invalid");

  try {
    await createInventoryItem(parsed.data);
  } catch (error) {
    if (isDuplicateSkuError(error)) redirect("/admin/inventory?error=duplicate");
    throw error;
  }
  revalidatePath("/admin");
  revalidatePath("/admin/inventory");
  revalidatePath("/products");
  redirect("/admin/inventory?notice=created");
}

export async function updateInventoryAction(formData: FormData) {
  await requireAdmin();
  const parsed = inventoryUpdateSchema.safeParse({
    id: value(formData, "id"),
    sku: value(formData, "sku"),
    name: value(formData, "name"),
    platform: value(formData, "platform"),
    category: value(formData, "category"),
    condition: value(formData, "condition"),
    stock: value(formData, "stock"),
    price: value(formData, "price"),
    tradeInVoucher: value(formData, "tradeInVoucher"),
    tradeInCash: value(formData, "tradeInCash"),
    imageSrc: value(formData, "imageSrc"),
    imageWidth: value(formData, "imageWidth"),
    imageHeight: value(formData, "imageHeight"),
    status: value(formData, "status"),
    featured: formData.get("featured") === "on",
  });
  if (!parsed.success) redirect("/admin/inventory?error=invalid");
  try {
    await updateInventoryItem(parsed.data.id, parsed.data);
  } catch (error) {
    if (isDuplicateSkuError(error)) redirect("/admin/inventory?error=duplicate");
    throw error;
  }
  revalidatePath("/admin");
  revalidatePath("/admin/inventory");
  revalidatePath("/products");
  redirect("/admin/inventory?notice=updated");
}

export async function deleteInventoryAction(formData: FormData) {
  await requireAdmin();
  const id = value(formData, "id");
  if (!documentId.safeParse(id).success) redirect("/admin/inventory?error=invalid");
  await deleteInventoryItem(id);
  revalidatePath("/admin");
  revalidatePath("/admin/inventory");
  revalidatePath("/products");
  redirect("/admin/inventory?notice=deleted");
}

export async function createServiceAction(formData: FormData) {
  await requireAdmin();
  const parsed = serviceCreateSchema.safeParse({
    customerName: value(formData, "customerName"),
    phone: value(formData, "phone"),
    device: value(formData, "device"),
    issue: value(formData, "issue"),
    status: value(formData, "status"),
    estimatedCost: value(formData, "estimatedCost"),
    notes: value(formData, "notes"),
  });
  if (!parsed.success) redirect("/admin/services?error=invalid");
  const ticket = await createServiceRecord(parsed.data);
  revalidatePath("/admin");
  revalidatePath("/admin/services");
  redirect(`/admin/services?notice=created&ticket=${encodeURIComponent(ticket)}`);
}

export async function updateServiceAction(formData: FormData) {
  await requireAdmin();
  const parsed = serviceUpdateSchema.safeParse({
    id: value(formData, "id"),
    status: value(formData, "status"),
    estimatedCost: value(formData, "estimatedCost"),
    notes: value(formData, "notes"),
  });
  if (!parsed.success) redirect("/admin/services?error=invalid");
  await updateServiceRecord(parsed.data.id, parsed.data);
  revalidatePath("/admin");
  revalidatePath("/admin/services");
  redirect("/admin/services?notice=updated");
}
