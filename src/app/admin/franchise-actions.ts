"use server";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { franchiseFields, franchiseId, saveFranchisePhoto, deleteFranchisePhoto } from "@/lib/admin/franchise";
import { formFile, formText, formTextFields } from "@/lib/admin/form-data";
import { refreshAdminData } from "@/lib/admin/revalidate";
export async function saveFranchiseAction(data: FormData) {
  await requireAdmin();
  const id = formText(data, "id");
  const fields = franchiseFields.safeParse(formTextFields(data, ["city", "state", "location", "alt", "position", "status"]));
  if ((id && !franchiseId.safeParse(id).success) || !fields.success) redirect("/admin/franchise?error=invalid");
  try { await saveFranchisePhoto(id || undefined, fields.data, formFile(data, "image")); }
  catch { redirect("/admin/franchise?error=save"); }
  refreshAdminData("franchise");
  redirect(`/admin/franchise?notice=saved&saved=${Date.now()}`);
}
export async function deleteFranchiseAction(data: FormData) {
  await requireAdmin();
  const id = franchiseId.safeParse(formText(data, "id"));
  if (!id.success) redirect("/admin/franchise?error=invalid");
  try { await deleteFranchisePhoto(id.data); }
  catch { redirect("/admin/franchise?error=delete"); }
  refreshAdminData("franchise");
  redirect(`/admin/franchise?notice=deleted&saved=${Date.now()}`);
}
