import "server-only";
import { randomUUID } from "node:crypto";
import { FieldValue, type Transaction } from "firebase-admin/firestore";
import { firebaseFirestore } from "@/lib/firebase/firestore";
import type { TestOrder } from "@/lib/payments/orders";
import { orderEmailTemplate, type OrderEmailKind } from "./email-template";
import { mailConfig, sendOrderMail } from "./mail";
import { canRetryEmail, normalizedEmail, orderEmailId, sameMailbox } from "./notification-policy";
import type { Shipment } from "./tracking";

export type EmailJob = {
  id: string; orderId: string; kind: OrderEmailKind; recipient: string;
  status: "pending" | "sending" | "sent" | "failed" | "blocked" | "uncertain" | "suppressed";
  attempts: number; createdAt: string; updatedAt: string; nextAttemptAt?: number;
  sentAt?: string; messageId?: string; note?: string; token?: string; shipment?: Shipment;
};
const jobs = () => firebaseFirestore().collection("orderEmails");

/** Called in the same transaction as the paid/status change, never from a success page. */
export function enqueueOrderEmail(transaction: Transaction, order: TestOrder, kind: OrderEmailKind, shipment?: Shipment) {
  const now = new Date().toISOString();
  const recipient = normalizedEmail(kind === "admin" ? process.env.NOTIFICATION_EMAIL : order.customer?.email);
  const duplicate = kind === "admin" && sameMailbox(recipient, order.customer?.email);
  const id = orderEmailId(order.id, kind);
  const job: EmailJob = { id, orderId: order.id, kind, recipient, status: duplicate ? "suppressed" : "pending", attempts: 0, createdAt: now, updatedAt: now, ...(duplicate ? { note: "Business and customer email match. Customer confirmation includes the order details." } : { nextAttemptAt: Date.now() }), ...(shipment ? { shipment } : {}) };
  transaction.create(jobs().doc(id), job);
}

async function deliverJob(id: string) {
  const db = firebaseFirestore();
  const ref = jobs().doc(id);
  const claimed = await db.runTransaction(async (transaction) => {
    const job = (await transaction.get(ref)).data() as EmailJob | undefined;
    if (!job || job.nextAttemptAt === undefined || job.nextAttemptAt > Date.now()) return null;
    const order = (await transaction.get(db.collection("checkoutTestOrders").doc(job.orderId))).data() as TestOrder | undefined;
    const updatedAt = new Date().toISOString();
    if (job.status === "sending") {
      transaction.update(ref, { status: "uncertain", note: "Previous send did not finish recording its result. Check Gmail Sent before any manual resend.", updatedAt, nextAttemptAt: FieldValue.delete() });
      return null;
    }
    if (!canRetryEmail(job.status)) return null;
    if (!order || order.status !== "paid" || order.mode !== "test") {
      transaction.update(ref, { status: "blocked", note: "A verified paid test order is required.", updatedAt, nextAttemptAt: FieldValue.delete() });
      return null;
    }
    const recipient = job.recipient || normalizedEmail(job.kind === "admin" ? process.env.NOTIFICATION_EMAIL : order.customer?.email);
    if (job.kind === "admin" && sameMailbox(recipient, order.customer?.email)) {
      transaction.update(ref, { status: "suppressed", recipient, note: "Business and customer email match; duplicate notification suppressed.", updatedAt, nextAttemptAt: FieldValue.delete() });
      return null;
    }
    if (!recipient || !mailConfig()) {
      transaction.update(ref, { status: "blocked", note: "Configure Gmail SMTP and a valid recipient, then retry.", updatedAt, nextAttemptAt: Date.now() + 15 * 60_000 });
      return null;
    }
    const token = randomUUID();
    transaction.update(ref, { status: "sending", recipient, token, attempts: job.attempts + 1, updatedAt, nextAttemptAt: Date.now() + 120_000, note: "Sending to Gmail." });
    return { job: { ...job, recipient, attempts: job.attempts + 1 }, order, token };
  });
  if (!claimed) return;
  let outcome: Record<string, unknown>;
  try {
    const result = await sendOrderMail(claimed.job.recipient, claimed.job.id, orderEmailTemplate(claimed.order, claimed.job.kind, claimed.job.shipment));
    if (!result.accepted.length) throw Object.assign(new Error("Recipient rejected"), { responseCode: 550 });
    outcome = { status: "sent", sentAt: new Date().toISOString(), messageId: result.messageId, note: "Accepted by Gmail. Inbox delivery is not guaranteed.", nextAttemptAt: FieldValue.delete() };
  } catch (error) {
    const failure = error as { responseCode?: number; code?: string; command?: string };
    const definite = !!failure.responseCode || ["EAUTH", "EDNS", "ECONNECTION", "EENVELOPE", "ENOENT", "EACCES"].includes(failure.code ?? "") || failure.command === "CONN";
    outcome = definite ? { status: "failed", note: "Gmail connection or SMTP submission was rejected. Check configuration and retry.", nextAttemptAt: claimed.job.attempts < 5 ? Date.now() + Math.min(60, 2 ** claimed.job.attempts) * 60_000 : FieldValue.delete() } : { status: "uncertain", note: "Submission outcome is unknown. Check Gmail Sent; automatic resend is disabled to avoid duplicates.", nextAttemptAt: FieldValue.delete() };
  }
  // If recording fails after Gmail accepted, the expired lease becomes uncertain, never auto-resends.
  await db.runTransaction(async (transaction) => {
    const current = (await transaction.get(ref)).data() as EmailJob | undefined;
    if (!current || current.token !== claimed.token || current.status !== "sending") return;
    transaction.update(ref, { ...outcome, updatedAt: new Date().toISOString(), token: FieldValue.delete() });
  });
}

/** Dispatch failures never escape into payment or fulfilment success responses. */
export async function dispatchOrderEmails(orderId?: string) {
  try {
    const result = await (orderId ? jobs().where("orderId", "==", orderId).limit(3) : jobs().where("nextAttemptAt", "<=", Date.now()).limit(5)).get();
    const outcomes = await Promise.allSettled(result.docs.map((document) => deliverJob(document.id)));
    const failed = outcomes.filter((outcome) => outcome.status === "rejected").length;
    if (failed) console.error(JSON.stringify({ event: "email_queue_processing_failed", count: failed }));
    return { ok: failed === 0, checked: outcomes.length, failed };
  } catch {
    console.error(JSON.stringify({ event: "email_queue_unavailable" }));
    return { ok: false, checked: 0, failed: 0 };
  }
}

export async function listOrderEmails(orderId: string) {
  const result = await jobs().where("orderId", "==", orderId).limit(3).get();
  return result.docs.map((document) => document.data() as EmailJob);
}

export async function retryOrderEmail(orderId: string, kind: OrderEmailKind) {
  await firebaseFirestore().runTransaction(async (transaction) => {
    const ref = jobs().doc(orderEmailId(orderId, kind));
    const job = (await transaction.get(ref)).data() as EmailJob | undefined;
    if (!job || !canRetryEmail(job.status)) throw new Error("Only pending, blocked or failed emails can be retried. Uncertain sends require mailbox review.");
    transaction.update(ref, { status: "pending", nextAttemptAt: Date.now(), updatedAt: new Date().toISOString(), note: "Admin requested a retry." });
  });
}
