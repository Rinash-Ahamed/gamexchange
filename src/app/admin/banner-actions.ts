"use server";

import { revalidatePath, updateTag } from "next/cache";
import { PUBLIC_BANNERS_TAG } from "@/lib/public-cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { BannerError, bannerFieldsSchema, bannerIdSchema, deleteBanner, saveBanner } from "@/lib/admin/banners";

export type BannerSaveState = { error?: string; message?: string; saved?: number };

export async function saveBannerAction(_previous: BannerSaveState, data: FormData): Promise<BannerSaveState> {
  await requireAdmin();
  const rawId = String(data.get("id") ?? "");
  if (rawId && !bannerIdSchema.safeParse(rawId).success) return { error: "Invalid banner. Refresh the page." };
  const fields = bannerFieldsSchema.safeParse(Object.fromEntries(["title", "headline", "description", "alt", "position", "status"].map((key) => [key, String(data.get(key) ?? "")])));
  if (!fields.success) return { error: fields.error.issues[0]?.message ?? "Check the banner fields." };
  const input = data.get("image");
  const file = input instanceof File && input.size > 0 ? input : undefined;
  if (!rawId && !file) return { error: "Choose an image for the new banner." };
  try {
    await saveBanner(rawId || undefined, fields.data, file);
  } catch (error) {
    return { error: error instanceof BannerError ? error.message : "Unable to save the banner. Check your Firebase Storage bucket and service-account permissions, then try again." };
  }
  updateTag(PUBLIC_BANNERS_TAG);
  revalidatePath("/");
  revalidatePath("/admin/banners");
  return { message: fields.data.status === "published" ? "Banner published. It will appear on the next homepage visit or refresh." : "Draft saved. It is not shown on the website.", saved: Date.now() };
}

export async function deleteBannerAction(data: FormData) {
  await requireAdmin();
  const id = bannerIdSchema.safeParse(String(data.get("id") ?? ""));
  if (!id.success) redirect("/admin/banners?error=delete");
  try { await deleteBanner(id.data); }
  catch { redirect("/admin/banners?error=delete"); }
  updateTag(PUBLIC_BANNERS_TAG);
  revalidatePath("/");
  revalidatePath("/admin/banners");
  redirect("/admin/banners?notice=deleted");
}
