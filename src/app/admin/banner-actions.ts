"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { BannerError, bannerFieldsSchema, bannerIdSchema, deleteBanner, saveBanner } from "@/lib/admin/banners";
import { formFile, formText, formTextFields } from "@/lib/admin/form-data";
import { refreshAdminData } from "@/lib/admin/revalidate";

export type BannerSaveState = { error?: string; message?: string; saved?: number };

export async function saveBannerAction(_previous: BannerSaveState, data: FormData): Promise<BannerSaveState> {
  await requireAdmin();
  const rawId = formText(data, "id");
  if (rawId && !bannerIdSchema.safeParse(rawId).success) return { error: "Invalid banner. Refresh the page." };
  const fields = bannerFieldsSchema.safeParse(formTextFields(data, ["title", "headline", "description", "alt", "position", "status"]));
  if (!fields.success) return { error: fields.error.issues[0]?.message ?? "Check the banner fields." };
  const file = formFile(data, "image");
  if (!rawId && !file) return { error: "Choose an image for the new banner." };
  try {
    await saveBanner(rawId || undefined, fields.data, file);
  } catch (error) {
    return { error: error instanceof BannerError ? error.message : "Unable to save the banner. Please try again or contact support if the problem continues." };
  }
  refreshAdminData("banners");
  return { message: fields.data.status === "published" ? "Banner published." : "Draft saved.", saved: Date.now() };
}

export async function deleteBannerAction(data: FormData) {
  await requireAdmin();
  const id = bannerIdSchema.safeParse(formText(data, "id"));
  if (!id.success) redirect("/admin/banners?error=delete");
  try { await deleteBanner(id.data); }
  catch { redirect("/admin/banners?error=delete"); }
  refreshAdminData("banners");
  redirect(`/admin/banners?notice=deleted&saved=${Date.now()}`);
}
