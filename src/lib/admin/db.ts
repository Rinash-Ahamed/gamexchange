import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { applicationDefault, cert, getApps, initializeApp, type App } from "firebase-admin/app";
import {
  AggregateField,
  getFirestore,
  type Firestore,
  type Query,
  type QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import { products, type Product } from "@/data/products";
import type { DashboardStats, InventoryItem, ServiceRecord, ServiceStatus } from "./types";

const INVENTORY_COLLECTION = "inventory";
const INVENTORY_SKUS_COLLECTION = "inventorySkus";
const SERVICES_COLLECTION = "serviceRecords";
const DUPLICATE_SKU_CODE = "inventory/duplicate-sku";

type StoredInventoryItem = Omit<InventoryItem, "id">;
type StoredServiceRecord = Omit<ServiceRecord, "id">;

let firestore: Firestore | undefined;
let warnedAboutLocalProductFallback = false;

function firebaseApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;

  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  if (!projectId) {
    throw new Error("FIREBASE_PROJECT_ID is required to connect to Firestore.");
  }

  const useApplicationDefault = process.env.FIREBASE_USE_APPLICATION_DEFAULT_CREDENTIALS === "true";
  if (useApplicationDefault) {
    return initializeApp({ credential: applicationDefault(), projectId });
  }

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n").trim();
  if (!clientEmail || !privateKey) {
    throw new Error(
      "FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY are required unless FIREBASE_USE_APPLICATION_DEFAULT_CREDENTIALS=true.",
    );
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    projectId,
  });
}

function database() {
  if (firestore) return firestore;
  const databaseId = process.env.FIREBASE_DATABASE_ID?.trim();
  firestore = databaseId ? getFirestore(firebaseApp(), databaseId) : getFirestore(firebaseApp());
  return firestore;
}

function inventoryFromDocument(document: QueryDocumentSnapshot): InventoryItem {
  return { id: document.id, ...(document.data() as StoredInventoryItem) };
}

function serviceFromDocument(document: QueryDocumentSnapshot): ServiceRecord {
  return { id: document.id, ...(document.data() as StoredServiceRecord) };
}

function skuDocumentId(sku: string) {
  return createHash("sha256").update(sku.trim().toUpperCase()).digest("hex");
}

function duplicateSkuError() {
  return Object.assign(new Error("That SKU is already in use."), { code: DUPLICATE_SKU_CODE });
}

export function isDuplicateSkuError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === DUPLICATE_SKU_CODE;
}

async function ensureInventorySeeded() {
  const db = database();
  const inventory = db.collection(INVENTORY_COLLECTION);
  const existing = await inventory.limit(1).get();
  if (!existing.empty) return;

  const now = new Date().toISOString();
  const batch = db.batch();
  for (const product of products) {
    const item: StoredInventoryItem = {
      sku: product.id.toUpperCase(),
      name: product.name,
      platform: product.platform,
      category: product.category,
      condition: product.condition,
      stock: 1,
      price: product.price,
      tradeInVoucher: product.tradeInVoucher,
      tradeInCash: product.tradeInCash,
      imageSrc: product.image.src,
      imageWidth: product.image.width,
      imageHeight: product.image.height,
      featured: product.featured ?? false,
      status: "active",
      createdAt: now,
      updatedAt: now,
    };
    batch.set(inventory.doc(product.id), item);
    batch.set(db.collection(INVENTORY_SKUS_COLLECTION).doc(skuDocumentId(item.sku)), {
      inventoryId: product.id,
      sku: item.sku,
    });
  }
  await batch.commit();
}

export async function listInventory() {
  await ensureInventorySeeded();
  const snapshot = await database().collection(INVENTORY_COLLECTION).orderBy("updatedAt", "desc").get();
  return snapshot.docs.map(inventoryFromDocument);
}

export async function listPublicInventory() {
  await ensureInventorySeeded();
  const snapshot = await database()
    .collection(INVENTORY_COLLECTION)
    .where("status", "==", "active")
    .get();
  return snapshot.docs
    .map(inventoryFromDocument)
    .filter((item) => item.status === "active" && item.stock > 0)
    .toSorted((a, b) => Number(b.featured) - Number(a.featured) || b.updatedAt.localeCompare(a.updatedAt));
}

export async function listPublicProducts(): Promise<Product[]> {
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  if (
    process.env.NODE_ENV !== "production" &&
    (!projectId || projectId === "your-firebase-project-id")
  ) {
    if (!warnedAboutLocalProductFallback) {
      console.warn("Firebase is not configured; serving the local demo product catalog.");
      warnedAboutLocalProductFallback = true;
    }
    return [...products];
  }

  return (await listPublicInventory()).map((item) => ({
    id: item.id,
    name: item.name,
    platform: item.platform,
    category: item.category,
    condition: item.condition,
    price: item.price,
    tradeInVoucher: item.tradeInVoucher,
    tradeInCash: item.tradeInCash,
    image: { src: item.imageSrc, width: item.imageWidth, height: item.imageHeight },
    featured: item.featured,
  }));
}

export async function createInventoryItem(input: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">) {
  const db = database();
  const id = randomUUID();
  const now = new Date().toISOString();
  const itemRef = db.collection(INVENTORY_COLLECTION).doc(id);
  const skuRef = db.collection(INVENTORY_SKUS_COLLECTION).doc(skuDocumentId(input.sku));

  await db.runTransaction(async (transaction) => {
    if ((await transaction.get(skuRef)).exists) throw duplicateSkuError();
    transaction.set(itemRef, { ...input, createdAt: now, updatedAt: now } satisfies StoredInventoryItem);
    transaction.set(skuRef, { inventoryId: id, sku: input.sku });
  });
  return id;
}

export async function updateInventoryItem(
  id: string,
  input: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">,
) {
  const db = database();
  const itemRef = db.collection(INVENTORY_COLLECTION).doc(id);

  await db.runTransaction(async (transaction) => {
    const current = await transaction.get(itemRef);
    if (!current.exists) throw new Error("Inventory item not found.");

    const currentItem = current.data() as StoredInventoryItem;
    const previousSkuRef = db.collection(INVENTORY_SKUS_COLLECTION).doc(skuDocumentId(currentItem.sku));
    const nextSkuRef = db.collection(INVENTORY_SKUS_COLLECTION).doc(skuDocumentId(input.sku));
    if (previousSkuRef.id !== nextSkuRef.id) {
      const nextSku = await transaction.get(nextSkuRef);
      if (nextSku.exists && nextSku.data()?.inventoryId !== id) throw duplicateSkuError();
      transaction.delete(previousSkuRef);
      transaction.set(nextSkuRef, { inventoryId: id, sku: input.sku });
    }
    transaction.update(itemRef, { ...input, updatedAt: new Date().toISOString() });
  });
}

export async function deleteInventoryItem(id: string) {
  const db = database();
  const itemRef = db.collection(INVENTORY_COLLECTION).doc(id);
  await db.runTransaction(async (transaction) => {
    const current = await transaction.get(itemRef);
    if (!current.exists) return;
    const item = current.data() as StoredInventoryItem;
    transaction.delete(itemRef);
    transaction.delete(db.collection(INVENTORY_SKUS_COLLECTION).doc(skuDocumentId(item.sku)));
  });
}

export async function listServiceRecords(limit?: number) {
  let query: Query = database().collection(SERVICES_COLLECTION).orderBy("createdAt", "desc");
  if (limit) query = query.limit(limit);
  const snapshot = await query.get();
  return snapshot.docs.map(serviceFromDocument);
}

export async function createServiceRecord(
  input: Omit<ServiceRecord, "id" | "ticketNumber" | "createdAt" | "updatedAt">,
) {
  const id = randomUUID();
  const now = new Date().toISOString();
  const date = now.slice(2, 10).replaceAll("-", "");
  const ticketNumber = `GX-${date}-${id.slice(0, 8).toUpperCase()}`;
  const record: StoredServiceRecord = { ...input, ticketNumber, createdAt: now, updatedAt: now };
  await database().collection(SERVICES_COLLECTION).doc(id).set(record);
  return ticketNumber;
}

export async function updateServiceRecord(
  id: string,
  input: { status: ServiceStatus; estimatedCost: number; notes: string },
) {
  await database().collection(SERVICES_COLLECTION).doc(id).update({
    ...input,
    updatedAt: new Date().toISOString(),
  });
}

export async function dashboardStats(): Promise<DashboardStats> {
  await ensureInventorySeeded();
  const inventory = database().collection(INVENTORY_COLLECTION);
  const services = database().collection(SERVICES_COLLECTION);
  const [inventoryStats, lowStock, openServices, readyServices] = await Promise.all([
    inventory.aggregate({
      inventoryItems: AggregateField.count(),
      unitsInStock: AggregateField.sum("stock"),
    }).get(),
    inventory.where("stock", "<=", 2).count().get(),
    services.where("status", "not-in", ["completed", "cancelled"]).count().get(),
    services.where("status", "==", "ready").count().get(),
  ]);

  return {
    inventoryItems: inventoryStats.data().inventoryItems,
    unitsInStock: inventoryStats.data().unitsInStock,
    lowStockItems: lowStock.data().count,
    openServices: openServices.data().count,
    readyServices: readyServices.data().count,
  };
}
