"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { deleteFaq, FaqError, faqFieldsSchema, faqIdSchema, saveFaq } from "@/lib/admin/faqs";
import { formText, formTextFields } from "@/lib/admin/form-data";
import { refreshAdminData } from "@/lib/admin/revalidate";

export async function saveFaqAction(data: FormData) {
  await requireAdmin();
  const id = formText(data, "id");
  const fields = faqFieldsSchema.safeParse(formTextFields(data, ["q", "a", "position", "status"]));
  if (!fields.success || (id && !faqIdSchema.safeParse(id).success)) redirect("/admin/faqs?error=invalid");
  try { await saveFaq(id || undefined, fields.data); }
  catch (error) {
    if (error instanceof FaqError) redirect(`/admin/faqs?error=${error.code}`);
    throw error;
  }
  refreshAdminData("faqs");
  redirect(`/admin/faqs?notice=saved&saved=${Date.now()}`);
}

export async function deleteFaqAction(data: FormData) {
  await requireAdmin();
  const id = faqIdSchema.safeParse(formText(data, "id"));
  if (!id.success) redirect("/admin/faqs?error=invalid");
  try { await deleteFaq(id.data); }
  catch (error) {
    if (error instanceof FaqError) redirect(`/admin/faqs?error=${error.code}`);
    throw error;
  }
  refreshAdminData("faqs");
  redirect("/admin/faqs?notice=deleted");
}
