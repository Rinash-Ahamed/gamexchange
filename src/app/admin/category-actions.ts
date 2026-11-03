"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { CategoryError, deleteInventoryCategory, normalizeCategoryName, saveInventoryCategory } from "@/lib/admin/db";
import { formText } from "@/lib/admin/form-data";
import { refreshAdminData } from "@/lib/admin/revalidate";

const idSchema = z.string().regex(/^[a-zA-Z0-9-]{1,128}$/);
const nameSchema = z.string().transform(normalizeCategoryName).pipe(z.string().min(1).max(160));

export async function saveCategoryAction(formData: FormData) {
  const actor = await requireAdmin();
  const name = nameSchema.safeParse(formData.get("name"));
  const rawId = formText(formData, "id");
  if (!name.success || (rawId && !idSchema.safeParse(rawId).success)) redirect("/admin/categories?error=invalid");
  try {
    await saveInventoryCategory(name.data, actor, rawId || undefined);
  } catch (error) {
    if (error instanceof CategoryError) redirect(`/admin/categories?error=${error.code}`);
    throw error;
  }
  refreshAdminData("categories");
  redirect(`/admin/categories?notice=${rawId ? "renamed" : "created"}&saved=${Date.now()}`);
}

export async function deleteCategoryAction(formData: FormData) {
  const actor = await requireAdmin();
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) redirect("/admin/categories?error=invalid");
  try {
    await deleteInventoryCategory(id.data, actor);
  } catch (error) {
    if (error instanceof CategoryError) redirect(`/admin/categories?error=${error.code}`);
    throw error;
  }
  refreshAdminData("categories");
  redirect(`/admin/categories?notice=deleted&saved=${Date.now()}`);
}
