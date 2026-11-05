import "server-only";
import { z } from "zod";
import { firebaseFirestore } from "@/lib/firebase/firestore";
import type { TestOrder } from "@/lib/payments/orders";
import { enqueueOrderEmail } from "./outbox";
import { nextOrderStage, orderStages } from "./tracking";

const line = z.string().trim().max(150).refine((value) => [...value].every((character) => character.charCodeAt(0) >= 32 && character.charCodeAt(0) !== 127));
export const statusUpdateSchema = z.object({
  orderId: z.uuid(), previous: z.enum(orderStages), status: z.enum(orderStages),
  carrier: line, trackingNumber: line,
  trackingUrl: z.union([z.literal(""), z.url().max(1000).refine((value) => {
    try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password; }
    catch { return false; }
  }, "Use a secure HTTPS tracking link.")]),
});
export async function updateOrderStatus(input: z.infer<typeof statusUpdateSchema>, actor: string) {
  const db = firebaseFirestore();
  await db.runTransaction(async (transaction) => {
    const ref = db.collection("checkoutTestOrders").doc(input.orderId);
    const order = (await transaction.get(ref)).data() as TestOrder | undefined;
    if (!order || order.status !== "paid" || order.mode !== "test") throw new Error("Only verified paid test orders can be tracked.");
    const current = order.fulfillmentStatus ?? "Order Placed";
    if (current === input.status) return; // Repeated form submission is a no-op, including shipment email.
    if (current !== input.previous || nextOrderStage(current) !== input.status) throw new Error("The order changed. Refresh and follow the next status in the timeline.");
    const now = new Date().toISOString();
    const shipment = { carrier: input.carrier, trackingNumber: input.trackingNumber, trackingUrl: input.trackingUrl };
    transaction.update(ref, { fulfillmentStatus: input.status, updatedAt: now, history: [...(order.history ?? [{ status: "Order Placed", at: order.paidAt ?? order.updatedAt, actor: "payment-verification" }]), { status: input.status, at: now, actor }], ...(input.status === "Parcel Sent" ? { shipment } : {}) });
    if (input.status === "Parcel Sent") enqueueOrderEmail(transaction, order, "shipment", shipment);
  });
}
