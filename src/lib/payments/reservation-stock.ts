import "server-only";
import { createHash } from "node:crypto";
import type { Firestore, Transaction } from "firebase-admin/firestore";
import { changeTestStock, type TestStock } from "./stock-policy";

export const testStockId = (key: string, productId: string) => createHash("sha256").update(`${key}:${productId}`).digest("hex");
export const testPaymentId = (key: string, paymentId: string) => createHash("sha256").update(`${key}:${paymentId}`).digest("hex");

/** Read all counters before any transaction writes. Order state owns the matching holds. */
export async function readTestStock(db: Firestore, transaction: Transaction, key: string, lines: { id: string; quantity: number }[]) {
  const refs = lines.map((line) => db.collection("checkoutTestStock").doc(testStockId(key, line.id)));
  const documents = await transaction.getAll(...refs);
  return lines.map((line, index) => ({ line, ref: refs[index]!, stock: documents[index]!.data() as TestStock | undefined }));
}

/** Plan the entire cart before writing, so a late payment cannot partially consume stock. */
export function planTestStock(rows: Awaited<ReturnType<typeof readTestStock>>, operation: "release" | "consume-held" | "consume-free") {
  return rows.map((row) => {
    if (!row.stock) throw new Error("Sandbox stock ledger is missing. Manual reconciliation required.");
    return { ref: row.ref, stock: changeTestStock(row.stock, row.line.quantity, operation) };
  });
}
