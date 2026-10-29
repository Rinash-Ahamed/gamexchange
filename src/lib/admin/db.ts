import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { unstable_cache } from "next/cache";
import { PUBLIC_PRODUCTS_TAG } from "@/lib/public-cache";
import { firebaseFirestore as database } from "@/lib/firebase/firestore";
import {
  AggregateField,
  type DocumentData,
  type Query,
  type QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import { products, type Product } from "@/data/products";
import { inventoryCategories, type InventoryCategory, type DashboardStats, type InventoryItem, type ServiceRecord, type ServiceStatus } from "./types";

const INVENTORY_COLLECTION = "inventory";
const INVENTORY_SKUS_COLLECTION = "inventorySkus";
const SERVICES_COLLECTION = "serviceRecords";
const DUPLICATE_SKU_CODE = "inventory/duplicate-sku";

type StoredInventoryItem = Omit<InventoryItem, "id">;
type InventoryInput = Omit<InventoryItem, "id" | "createdAt" | "updatedAt" | "category" | "categoryId"> & { categoryId: string };
type InventoryImageFields = Pick<InventoryItem, "imageSrc" | "imageWidth" | "imageHeight" | "imageStoragePath" | "imageVersion">;

function inventoryImageSource(id: string, input: Partial<InventoryImageFields>) {
  return input.imageStoragePath && input.imageVersion
    ? { imageSrc: `/api/inventory/${id}/image?v=${encodeURIComponent(input.imageVersion)}` } : {};
}
type StoredServiceRecord = Omit<ServiceRecord, "id">;

let warnedAboutLocalProductFallback = false;
let seedCheck: Promise<void> | undefined;
let categoryCheck: Promise<void> | undefined;

export class CategoryError extends Error {
  constructor(public readonly code: "category-missing" | "category-duplicate" | "category-used" | "category-limit") { super(code); }
}

export function normalizeCategoryName(name: string) {
  return name.normalize("NFKC").trim().replace(/\s+/g, " ");
}

function categoryKey(name: string) { return normalizeCategoryName(name).toLocaleLowerCase("en") || "uncategorized"; }
function categoryRegistry() { return database().collection("settings").doc("inventoryCategories"); }
function storedCategories(data: DocumentData | undefined): InventoryCategory[] {
  return (data?.categories ?? []) as InventoryCategory[];
}

function categoryMatches(category: InventoryCategory, item: Pick<InventoryItem, "categoryId" | "category">) {
  return item.categoryId ? item.categoryId === category.id : category.aliases.includes(categoryKey(item.category));
}

async function ensureCategoriesInitialized() {
  await ensureInventorySeeded();
  categoryCheck ??= database().runTransaction(async (transaction) => {
    const ref = categoryRegistry();
    if ((await transaction.get(ref)).exists) return;
    const inventory = await transaction.get(database().collection(INVENTORY_COLLECTION));
    const names = new Map<string, string>();
    for (const name of [...inventoryCategories, ...inventory.docs.map((doc) => String(doc.data().category ?? "Uncategorized"))]) {
      const cleaned = normalizeCategoryName(name) || "Uncategorized";
      if (!names.has(categoryKey(cleaned))) names.set(categoryKey(cleaned), cleaned);
    }
    const categories = [...names].map(([key, name]) => ({
      id: createHash("sha256").update(key).digest("hex"), name, aliases: [key],
    }));
    transaction.set(ref, { categories, updatedAt: new Date().toISOString() });
  }).catch((error) => { categoryCheck = undefined; throw error; });
  await categoryCheck;
}

export async function listInventoryCategories() {
  await ensureCategoriesInitialized();
  return storedCategories((await categoryRegistry().get()).data()).toSorted((a, b) => a.name.localeCompare(b.name));
}

function resolveInventoryCategory(item: InventoryItem, categories: InventoryCategory[]): InventoryItem {
  const category = categories.find((entry) => categoryMatches(entry, item));
  return category ? { ...item, categoryId: category.id, category: category.name } : item;
}

export async function saveInventoryCategory(name: string, id?: string) {
  await ensureCategoriesInitialized();
  const cleaned = normalizeCategoryName(name);
  const key = categoryKey(cleaned);
  if (!cleaned || cleaned.length > 160) throw new CategoryError("category-missing");
  await database().runTransaction(async (transaction) => {
    const ref = categoryRegistry();
    const categories = storedCategories((await transaction.get(ref)).data());
    if (id && !categories.some((category) => category.id === id)) throw new CategoryError("category-missing");
    if (categories.some((category) => category.id !== id && (categoryKey(category.name) === key || category.aliases.includes(key)))) {
      throw new CategoryError("category-duplicate");
    }
    if (id) {
      // Keep original aliases so legacy product records follow renames without a bulk rewrite.
      const index = categories.findIndex((category) => category.id === id);
      categories[index] = { ...categories[index], name: cleaned };
    } else {
      if (categories.length >= 100) throw new CategoryError("category-limit");
      categories.push({ id: randomUUID(), name: cleaned, aliases: [key] });
    }
    transaction.set(ref, { categories, updatedAt: new Date().toISOString() });
  });
}

export async function deleteInventoryCategory(id: string) {
  await ensureCategoriesInitialized();
  await database().runTransaction(async (transaction) => {
    const ref = categoryRegistry();
    const categories = storedCategories((await transaction.get(ref)).data());
    const category = categories.find((entry) => entry.id === id);
    if (!category) throw new CategoryError("category-missing");
    const inventory = await transaction.get(database().collection(INVENTORY_COLLECTION));
    if (inventory.docs.some((doc) => categoryMatches(category, doc.data() as StoredInventoryItem))) throw new CategoryError("category-used");
    transaction.set(ref, { categories: categories.filter((entry) => entry.id !== id), updatedAt: new Date().toISOString() });
  });
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
  seedCheck ??= initializeInventory().catch((error) => { seedCheck = undefined; throw error; });
  await seedCheck;
}

async function initializeInventory() {
  const db = database();
  const inventory = db.collection(INVENTORY_COLLECTION);
  const marker = db.collection("settings").doc("inventoryInitialized");
  await db.runTransaction(async (transaction) => {
    if ((await transaction.get(marker)).exists) return;
    const existing = await transaction.get(inventory.limit(1));
    const now = new Date().toISOString();
    if (existing.empty) {
      for (const product of products) {
        const item: StoredInventoryItem = {
          sku: product.id.toUpperCase(), name: product.name, platform: product.platform,
          category: product.category, condition: product.condition, stock: 1,
          price: product.price, tradeInVoucher: product.tradeInVoucher, tradeInCash: product.tradeInCash,
          imageSrc: product.image.src, imageWidth: product.image.width, imageHeight: product.image.height,
          featured: product.featured ?? false, status: "active", createdAt: now, updatedAt: now,
        };
        transaction.set(inventory.doc(product.id), item);
        transaction.set(db.collection(INVENTORY_SKUS_COLLECTION).doc(skuDocumentId(item.sku)), { inventoryId: product.id, sku: item.sku });
      }
    }
    transaction.set(marker, { initialized: true, createdAt: now });
  });
}

export async function listInventory() {
  await ensureInventorySeeded();
  const [snapshot, categories] = await Promise.all([
    database().collection(INVENTORY_COLLECTION).orderBy("updatedAt", "desc").get(), listInventoryCategories(),
  ]);
  return snapshot.docs.map((doc) => resolveInventoryCategory(inventoryFromDocument(doc), categories));
}

export async function getInventoryItem(id: string): Promise<InventoryItem | null> {
  if (!/^[a-zA-Z0-9-]{1,128}$/.test(id)) return null;
  const document = await database().collection(INVENTORY_COLLECTION).doc(id).get();
  return document.exists ? { ...(document.data() as StoredInventoryItem), id: document.id } : null;
}

export async function listPublicInventory() {
  await ensureInventorySeeded();
  const [snapshot, categories] = await Promise.all([
    database().collection(INVENTORY_COLLECTION).where("status", "==", "active").get(), listInventoryCategories(),
  ]);
  return snapshot.docs
    .map((doc) => resolveInventoryCategory(inventoryFromDocument(doc), categories))
    .filter((item) => item.status === "active" && item.stock > 0)
    .toSorted((a, b) => Number(b.featured) - Number(a.featured) || b.updatedAt.localeCompare(a.updatedAt));
}

async function readPublicProducts(): Promise<Product[]> {
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  if (!projectId || projectId === "your-firebase-project-id") {
    if (!warnedAboutLocalProductFallback) {
      console.warn("FIREBASE_PROJECT_ID is not configured; serving the local demo product catalog.");
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

export const listPublicProducts = unstable_cache(readPublicProducts,
  ["public-products-v1", process.env.FIREBASE_PROJECT_ID ?? "demo", process.env.FIREBASE_DATABASE_ID ?? "(default)"],
  { revalidate: 60, tags: [PUBLIC_PRODUCTS_TAG] });

export async function createInventoryItem(input: InventoryInput) {
  await ensureCategoriesInitialized();
  const db = database();
  const id = randomUUID();
  const now = new Date().toISOString();
  const itemRef = db.collection(INVENTORY_COLLECTION).doc(id);
  const skuRef = db.collection(INVENTORY_SKUS_COLLECTION).doc(skuDocumentId(input.sku));

  await db.runTransaction(async (transaction) => {
    const categories = storedCategories((await transaction.get(categoryRegistry())).data());
    const category = categories.find((entry) => entry.id === input.categoryId);
    if (!category) throw new CategoryError("category-missing");
    if ((await transaction.get(skuRef)).exists) throw duplicateSkuError();
    transaction.set(itemRef, { ...input, category: category.name, ...inventoryImageSource(id, input), createdAt: now, updatedAt: now } satisfies StoredInventoryItem);
    transaction.set(skuRef, { inventoryId: id, sku: input.sku });
  });
  return id;
}

export async function updateInventoryItem(
  id: string,
  input: Omit<InventoryInput, keyof InventoryImageFields | "tradeInVoucher" | "tradeInCash"> & Partial<InventoryImageFields>,
) {
  await ensureCategoriesInitialized();
  const db = database();
  const itemRef = db.collection(INVENTORY_COLLECTION).doc(id);

  return db.runTransaction(async (transaction) => {
    const categories = storedCategories((await transaction.get(categoryRegistry())).data());
    const category = categories.find((entry) => entry.id === input.categoryId);
    if (!category) throw new CategoryError("category-missing");
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
    transaction.update(itemRef, { ...input, category: category.name, ...inventoryImageSource(id, input), updatedAt: new Date().toISOString() });
    return input.imageStoragePath && input.imageStoragePath !== currentItem.imageStoragePath ? currentItem.imageStoragePath : undefined;
  });
}

export async function deleteInventoryItem(id: string) {
  const db = database();
  const itemRef = db.collection(INVENTORY_COLLECTION).doc(id);
  return db.runTransaction(async (transaction) => {
    const current = await transaction.get(itemRef);
    if (!current.exists) return;
    const item = current.data() as StoredInventoryItem;
    transaction.delete(itemRef);
    transaction.delete(db.collection(INVENTORY_SKUS_COLLECTION).doc(skuDocumentId(item.sku)));
    return item.imageStoragePath;
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
