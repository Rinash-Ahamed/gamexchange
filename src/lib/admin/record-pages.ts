import "server-only";
import { FieldPath } from "firebase-admin/firestore";
import { firebaseFirestore } from "@/lib/firebase/firestore";
import type { TestOrder } from "@/lib/payments/orders";
import type { ServiceRecord } from "./types";
import { requireAdmin } from "./auth";
import { adminRecordPageSize, recordPageRequest, recordPageResult, type AdminRecordScope, type RecordPageInput } from "./record-cursor";

type RecordTypes = { orders: TestOrder; services: ServiceRecord };
const collections = { orders: "checkoutTestOrders", services: "serviceRecords" } as const;

/** Private, uncached keyset query. Does not change public catalogue or dashboard queries. */
export async function readAdminRecordPage<S extends AdminRecordScope>(scope: S, input: RecordPageInput) {
  await requireAdmin();
  const page = recordPageRequest(scope, input);
  let query = firebaseFirestore().collection(collections[scope]).orderBy("createdAt", "desc").orderBy(FieldPath.documentId(), "desc");
  if (page.cursor && page.direction === "older") query = query.startAfter(page.cursor.createdAt, page.cursor.id);
  if (page.cursor && page.direction === "newer") query = query.endBefore(page.cursor.createdAt, page.cursor.id);
  const snapshot = await (page.direction === "newer" ? query.limitToLast(adminRecordPageSize + 1) : query.limit(adminRecordPageSize + 1)).get();
  const items = snapshot.docs.map((document) => ({ ...document.data(), id: document.id }) as RecordTypes[S]);
  return recordPageResult(scope, page, items);
}
