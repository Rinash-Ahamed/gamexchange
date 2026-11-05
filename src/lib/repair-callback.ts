import "server-only";
import { createHmac } from "node:crypto";
import type { z } from "zod";
import type { repairSchema } from "./validation";
import { firebaseFirestore } from "./firebase/firestore";
import { sharedSecurityStore, signingSecret } from "./security-store";
import { appendAudit } from "./admin/audit";
import type { ServiceRecord } from "./admin/types";

export async function saveRepairCallback(enquiry: z.output<typeof repairSchema>) {
  if (!sharedSecurityStore() || enquiry.delivery !== "callback" || !enquiry.callbackRequestId || enquiry.callbackConsent !== true) throw new Error("Callback storage is unavailable.");
  const id = enquiry.callbackRequestId;
  const fingerprint = createHmac("sha256", signingSecret()).update(JSON.stringify({ ...enquiry, callbackRequestId: undefined, website: undefined, contactMethod: "Phone call" })).digest("hex");
  const db = firebaseFirestore();
  const ref = db.collection("serviceRecords").doc(id);
  return db.runTransaction(async (transaction) => {
    const previous = (await transaction.get(ref)).data();
    if (previous) {
      if (previous.source !== "website-callback" || previous.callbackFingerprint !== fingerprint) throw new Error("Callback details changed.");
      return previous.ticketNumber as string;
    }
    const now = new Date().toISOString();
    const ticketNumber = `GX-${now.slice(2, 10).replaceAll("-", "")}-${id.slice(0, 8).toUpperCase()}`;
    const record: Omit<ServiceRecord, "id"> = {
      ticketNumber, customerName: enquiry.name, phone: enquiry.phone,
      device: enquiry.device === "Other" ? enquiry.deviceOther : enquiry.device,
      issue: `${enquiry.fault.join(", ")}\n${enquiry.details}`,
      status: "received", estimatedCost: 0, notes: `Callback requested through the repair form. Category: ${enquiry.category}. Contact the customer before confirming a repair.`,
      source: "website-callback", branch: enquiry.branch, contactMethod: "Phone call", callbackFingerprint: fingerprint,
      callbackConsent: { accepted: true, at: now }, createdAt: now, updatedAt: now,
    };
    transaction.create(ref, record);
    appendAudit(transaction, { uid: "website:repair-callback" }, "created", "serviceRecords", id, {}, record);
    return ticketNumber;
  });
}
