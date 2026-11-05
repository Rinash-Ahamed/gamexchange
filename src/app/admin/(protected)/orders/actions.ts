"use server";

import { after } from "next/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { statusUpdateSchema, updateOrderStatus } from "@/lib/orders/manage";
import { dispatchOrderEmails, retryOrderEmail } from "@/lib/orders/outbox";

function finish(orderId: string, failed: boolean): never {
  revalidatePath("/admin/orders");
  redirect(`/admin/orders?order=${encodeURIComponent(orderId)}&${failed ? "error=update" : "notice=saved"}`);
}
export async function changeOrderStatus(form: FormData) {
  const admin = await requireAdmin();
  const parsed = statusUpdateSchema.safeParse(Object.fromEntries(["orderId", "previous", "status", "carrier", "trackingNumber", "trackingUrl"].map((key) => [key, form.get(key) ?? ""])));
  if (!parsed.success) finish("", true);
  const input = parsed.data;
  let failed = false;
  try { await updateOrderStatus(input, admin.uid); }
  catch { failed = true; }
  if (!failed) after(() => dispatchOrderEmails(input.orderId));
  finish(input.orderId, failed);
}
export async function retryEmail(form: FormData) {
  await requireAdmin();
  const parsed = z.object({ orderId: z.uuid(), kind: z.enum(["confirmation", "admin", "shipment"]) }).safeParse({ orderId: form.get("orderId"), kind: form.get("kind") });
  if (!parsed.success) finish("", true);
  let failed = false;
  try { await retryOrderEmail(parsed.data.orderId, parsed.data.kind); }
  catch { failed = true; }
  if (!failed) after(() => dispatchOrderEmails(parsed.data.orderId));
  finish(parsed.data.orderId, failed);
}
