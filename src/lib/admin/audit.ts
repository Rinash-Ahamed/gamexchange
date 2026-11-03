import "server-only";
import type { Transaction } from "firebase-admin/firestore";
import { firebaseFirestore } from "@/lib/firebase/firestore";

export type AuditActor = { uid: string };
type AuditResource = "inventory" | "serviceRecords" | "categories";
type AuditValues = Record<string, string | number | boolean | null>;
export type AuditEntry = {
  id: string; actorUid: string; action: "created" | "updated" | "deleted";
  resource: AuditResource; resourceId: string; createdAt: string;
  changedFields: string[]; before: AuditValues; after: AuditValues;
};

// Never duplicate customer names, phones, issues, notes, image paths or descriptions.
const summaryFields = ["sku", "stock", "price", "originalPrice", "discountPercent", "status", "estimatedCost", "categoryId"];
function summary(value: Record<string, unknown>): AuditValues {
  return Object.fromEntries(summaryFields.flatMap((field) => {
    const item = value[field];
    return typeof item === "string" || typeof item === "boolean" || typeof item === "number" || item === null ? [[field, item]] : [];
  }));
}

export function appendAudit(transaction: Transaction, actor: AuditActor, action: AuditEntry["action"], resource: AuditResource,
  resourceId: string, before: Record<string, unknown>, after: Record<string, unknown>) {
  if (!actor.uid) throw new Error("Audit identity required.");
  const changedFields = [...new Set([...Object.keys(before), ...Object.keys(after)])]
    .filter((field) => !["createdAt", "updatedAt"].includes(field) && JSON.stringify(before[field]) !== JSON.stringify(after[field]));
  transaction.create(firebaseFirestore().collection("auditLogs").doc(), {
    actorUid: actor.uid, action, resource, resourceId, createdAt: new Date().toISOString(),
    changedFields, before: summary(before), after: summary(after),
  });
}

export async function listAuditEntries() {
  const snapshot = await firebaseFirestore().collection("auditLogs").orderBy("createdAt", "desc").limit(50).get();
  return snapshot.docs.map((document) => ({ ...document.data(), id: document.id }) as AuditEntry);
}
