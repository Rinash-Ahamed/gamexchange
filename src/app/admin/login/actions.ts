"use server";

import { redirect } from "next/navigation";
import { adminAuthConfigured, createAdminSession, verifyAdminCredentials } from "@/lib/admin/auth";

export async function loginAction(formData: FormData) {
  if (!adminAuthConfigured()) redirect("/admin/login?error=setup");

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password || !verifyAdminCredentials(email, password)) {
    redirect("/admin/login?error=credentials");
  }

  await createAdminSession(email);
  redirect("/admin");
}
