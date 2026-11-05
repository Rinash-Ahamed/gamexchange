"use server";

import { after } from "next/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { statusUpdateSchema, updateOrderStatus } from "@/lib/orders/manage";
import { dispatchOrderEmails, retryOrderEmail } from "@/lib/orders/outbox";
import { recordPageFormLocation, recordPageHref, type RecordPageLocation } from "@/lib/admin/record-cursor";

function finish(orderId: string, failed: boolean, location: RecordPageLocation): never {
  revalidatePath("/admin/orders");
  redirect(recordPageHref("orders", location, { order: orderId, ...(failed ? { error: "update" } : { notice: "saved" }) }));
}
export async function changeOrderStatus(form: FormData) {
  const admin = await requireAdmin();
  const location = recordPageFormLocation("orders", form);
  const parsed = statusUpdateSchema.safeParse(Object.fromEntries(["orderId", "previous", "status", "carrier", "trackingNumber", "trackingUrl"].map((key) => [key, form.get(key) ?? ""])));
  if (!parsed.success) finish("", true, location);
  const input = parsed.data;
  let failed = false;
  try { await updateOrderStatus(input, admin.uid); }
  catch { failed = true; }
  if (!failed) after(() => dispatchOrderEmails(input.orderId));
  finish(input.orderId, failed, location);
}
export async function retryEmail(form: FormData) {
  await requireAdmin();
  const location = recordPageFormLocation("orders", form);
  const parsed = z.object({ orderId: z.uuid(), kind: z.enum(["confirmation", "admin", "shipment"]) }).safeParse({ orderId: form.get("orderId"), kind: form.get("kind") });
  if (!parsed.success) finish("", true, location);
  let failed = false;
  try { await retryOrderEmail(parsed.data.orderId, parsed.data.kind); }
  catch { failed = true; }
  if (!failed) after(() => dispatchOrderEmails(parsed.data.orderId));
  finish(parsed.data.orderId, failed, location);
}
