import "server-only";

import { randomUUID } from "node:crypto";
import { unstable_cache } from "next/cache";
import { z } from "zod";
import type { DocumentData } from "firebase-admin/firestore";
import { faqs as defaults } from "@/data/faq";
import { firebaseFirestore } from "@/lib/firebase/firestore";
import { PUBLIC_FAQS_TAG } from "@/lib/public-cache";

export const faqFieldsSchema = z.object({
  q: z.string().trim().min(3).max(200),
  a: z.string().trim().min(3).max(6000),
  position: z.coerce.number().int().min(1).max(999),
  status: z.enum(["draft", "published"]),
});
export const faqIdSchema = z.string().regex(/^[a-zA-Z0-9-]{1,80}$/);
type FaqFields = z.infer<typeof faqFieldsSchema>;
export type AdminFaq = FaqFields & { id: string };
export type PublicFaq = Pick<FaqFields, "q" | "a">;
export class FaqError extends Error {
  constructor(public readonly code: "missing" | "limit" | "duplicate") { super(code); }
}

const settings = () => firebaseFirestore().collection("settings").doc("homepageFaqs");
const readItems = (data: DocumentData | undefined): AdminFaq[] => data?.items ?? [];
const sorted = (items: AdminFaq[]) => items.toSorted((a, b) => a.position - b.position || a.id.localeCompare(b.id));

/** Initialise only in admin. An intentionally empty list is never seeded again. */
async function initialiseFaqs() {
  await firebaseFirestore().runTransaction(async (transaction) => {
    const ref = settings();
    if ((await transaction.get(ref)).exists) return;
    transaction.set(ref, {
      items: defaults.map((faq, index) => ({ ...faq, id: `faq-${index + 1}`, position: index + 1, status: "published" })),
      updatedAt: new Date().toISOString(),
    });
  });
}

export async function listAdminFaqs() {
  await initialiseFaqs();
  return sorted(readItems((await settings().get()).data()));
}

export async function saveFaq(id: string | undefined, fields: FaqFields) {
  await initialiseFaqs();
  await firebaseFirestore().runTransaction(async (transaction) => {
    const ref = settings();
    const items = readItems((await transaction.get(ref)).data());
    if (id && !items.some((item) => item.id === id)) throw new FaqError("missing");
    if (!id && items.length >= 30) throw new FaqError("limit");
    const question = fields.q.toLocaleLowerCase("en").replace(/\s+/g, " ");
    if (items.some((item) => item.id !== id && item.q.toLocaleLowerCase("en").replace(/\s+/g, " ") === question)) throw new FaqError("duplicate");
    const faq = { ...fields, id: id ?? randomUUID() };
    const next = id ? items.map((item) => item.id === id ? faq : item) : [...items, faq];
    transaction.set(ref, { items: next, updatedAt: new Date().toISOString() });
  });
}

export async function deleteFaq(id: string) {
  await firebaseFirestore().runTransaction(async (transaction) => {
    const ref = settings();
    const items = readItems((await transaction.get(ref)).data());
    if (!items.some((item) => item.id === id)) throw new FaqError("missing");
    transaction.set(ref, { items: items.filter((item) => item.id !== id), updatedAt: new Date().toISOString() });
  });
}

async function readPublicFaqs(): Promise<PublicFaq[]> {
  const project = process.env.FIREBASE_PROJECT_ID?.trim();
  if (!project || project === "your-firebase-project-id") return [...defaults];
  const snapshot = await settings().get();
  if (!snapshot.exists) return [...defaults];
  return sorted(readItems(snapshot.data())).filter((item) => item.status === "published").map(({ q, a }) => ({ q, a }));
}

export const listPublicFaqs = unstable_cache(readPublicFaqs,
  ["public-faqs-v1", process.env.FIREBASE_PROJECT_ID ?? "demo", process.env.FIREBASE_DATABASE_ID ?? "(default)"],
  { revalidate: 60, tags: [PUBLIC_FAQS_TAG] });
