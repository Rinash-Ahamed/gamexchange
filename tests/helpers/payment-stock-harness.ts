import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { runInNewContext } from "node:vm";
import { ModuleKind, ScriptTarget, transpileModule } from "typescript";
import type * as Orders from "../../src/lib/payments/orders";

type Data = Record<string, unknown>;
type Ref = { path: string; get: () => Promise<{ data: () => Data | undefined }>; update: (data: Data) => Promise<void> };
type Query = {
  doc: (id: string) => Ref;
  where: (field: string, operator: string, value: unknown) => Query;
  orderBy: (field: string) => Query;
  limit: (count: number) => Query;
  get: () => Promise<{ docs: { id: string | undefined; data: () => Data | undefined }[] }>;
};
const deleted = Symbol("deleted");

/** Serialized in-memory transactions with rollback and read-before-write enforcement.
 * Exercises real application modules without loading credentials, Firebase or Razorpay.
 * This models locking; it does not replace a Firestore emulator/provider race test.
 */
export function paymentStockHarness() {
  const records = new Map<string, Data>();
  const payments = new Map<string, Data>();
  const gatewayOrders = new Map<string, Data>();
  const gatewayCalls: string[] = [];
  let unavailable = false;
  let uncertainCreate = false;
  let sequence = 0;
  let queue = Promise.resolve();
  const clone = (data: Data | undefined) => data ? structuredClone(data) : undefined;
  const snapshot = (path: string) => ({ data: () => clone(records.get(path)) });
  const update = (path: string, data: Data) => {
    const current = { ...records.get(path) };
    for (const [key, value] of Object.entries(data)) {
      if (value === deleted) delete current[key];
      else current[key] = value;
    }
    records.set(path, current);
  };
  const doc = (path: string): Ref => ({ path, get: async () => snapshot(path), update: async (data) => { update(path, data); } });
  function query(name: string, filters: [string, string, unknown][] = [], count = 100, sort?: string): Query {
    return {
      doc: (id: string) => doc(`${name}/${id}`),
      where: (field: string, operator: string, value: unknown) => query(name, [...filters, [field, operator, value]], count, sort),
      orderBy: (field: string) => query(name, filters, count, field),
      limit: (value: number) => query(name, filters, value, sort),
      get: async () => {
        let entries = [...records].filter(([path, data]) => path.startsWith(`${name}/`) && filters.every(([field, operator, value]) => {
          const actual = data[field];
          return operator === "==" ? actual === value : typeof actual === "number" && typeof value === "number" && actual <= value;
        }));
        const sortField = sort;
        if (sortField) entries = entries.sort((a, b) => Number(a[1][sortField]) - Number(b[1][sortField]));
        return { docs: entries.slice(0, count).map(([path]) => ({ id: path.split("/")[1], ...snapshot(path) })) };
      },
    };
  }
  const db = {
    collection: (name: string) => query(name),
    runTransaction: async <T>(run: (transaction: object) => Promise<T>): Promise<T> => {
      const previous = queue;
      let unlock!: () => void;
      queue = new Promise<void>((done) => { unlock = done; });
      await previous;
      const writes: (() => void)[] = [];
      const read = async (ref: Ref) => {
        if (writes.length) throw new Error("Transaction read after write");
        return snapshot(ref.path);
      };
      try {
        const result = await run({
          get: read,
          getAll: (...refs: Ref[]) => Promise.all(refs.map(read)),
          create: (ref: Ref, data: Data) => { writes.push(() => { if (records.has(ref.path)) throw new Error("Document already exists"); records.set(ref.path, structuredClone(data)); }); },
          set: (ref: Ref, data: Data) => { writes.push(() => { records.set(ref.path, structuredClone(data)); }); },
          update: (ref: Ref, data: Data) => { writes.push(() => { update(ref.path, data); }); },
        });
        const before = new Map(records);
        try { for (const write of writes) write(); }
        catch (error) { records.clear(); for (const entry of before) records.set(...entry); throw error; }
        return result;
      } finally { unlock(); }
    },
  };
  const fakeFetch = async (url: string, options: { body?: string }) => {
    const path = url.replace("https://api.razorpay.com/v1/", "");
    gatewayCalls.push(path);
    if (unavailable || path === "orders" && uncertainCreate) throw new Error("Fixture connection lost");
    let data: Data | undefined;
    if (path === "orders" && options.body) {
      const created: Data = { ...JSON.parse(options.body), id: `order_fixture${++sequence}`, status: "created" };
      data = created;
      gatewayOrders.set(String(created.id), created);
    } else if (path.startsWith("payments/")) data = payments.get(path.split("/")[1]!);
    else if (path.endsWith("/payments")) {
      const items = [...payments.values()].filter((payment) => payment.order_id === path.split("/")[1]);
      data = { count: items.length, items };
    } else data = gatewayOrders.get(path.split("/")[1]!);
    return { ok: Boolean(data), json: async () => structuredClone(data) };
  };
  const require = createRequire(resolve("package.json"));
  const modules = new Map<string, { exports: unknown }>();
  function load(path: string): unknown {
    const absolute = resolve(path);
    const cached = modules.get(absolute);
    if (cached) return cached.exports;
    const loadedModule = { exports: {} as unknown };
    modules.set(absolute, loadedModule);
    const source = transpileModule(readFileSync(absolute, "utf8"), { compilerOptions: { module: ModuleKind.CommonJS, target: ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
    const injected = (id: string): unknown => {
      if (id === "server-only") return {};
      if (id === "next/server") return { after: () => undefined };
      if (id === "firebase-admin/firestore") return { FieldValue: { delete: () => deleted } };
      if (id === "@/lib/firebase/firestore") return { firebaseFirestore: () => db };
      if (id === "@/data/catalog") return { isPcComponentCategory: (category: string) => category === "PC Component" };
      if (id === "@/lib/orders/outbox") return { dispatchOrderEmails: async () => undefined, enqueueOrderEmail: (transaction: { create: (ref: Ref, data: Data) => void }, order: Orders.TestOrder, kind: string) => transaction.create(doc(`orderEmails/${order.id}-${kind}`), { orderId: order.id, kind }) };
      if (id.startsWith("./")) return load(resolve(dirname(absolute), `${id}.ts`));
      return require(id);
    };
    runInNewContext(source, { module: loadedModule, exports: loadedModule.exports, require: injected, Buffer, AbortSignal, fetch: fakeFetch, process: { env: { RAZORPAY_KEY_ID: "rzp_test_fixture", RAZORPAY_KEY_SECRET: "fixture-secret", RAZORPAY_WEBHOOK_SECRET: "fixture-webhook", FIREBASE_PROJECT_ID: "fixture-project" } } }, { filename: absolute });
    return loadedModule.exports;
  }
  const orders = load("src/lib/payments/orders.ts") as typeof Orders;
  const stock = () => [...records].filter(([path]) => path.startsWith("checkoutTestStock/")).map(([, value]) => value);
  const savedOrder = (id: string) => records.get(`checkoutTestOrders/${id}`) as Orders.TestOrder | undefined;
  return {
    orders, records, stock, savedOrder, gatewayCalls, payments,
    seed: (id: string, quantity = 1) => records.set(`inventory/${id}`, { name: id, stock: quantity, status: "active", category: "Console", price: 100 }),
    expire: (id: string) => {
      const order = savedOrder(id)!;
      records.set(`checkoutTestOrders/${id}`, { ...order, reservation: { ...order.reservation, expiresAt: Date.now() - 1000 }, reservationCheckAt: Date.now() - 1000 });
    },
    payment: (id: string, status = "captured") => {
      const order = savedOrder(id)!;
      const paymentId = `pay_fixture${id.replaceAll("-", "")}`;
      payments.set(paymentId, { id: paymentId, order_id: order.razorpayOrderId, amount: order.amount, currency: "INR", amount_refunded: 0, status });
      const gateway = gatewayOrders.get(order.razorpayOrderId!)!;
      gateway.status = status === "captured" ? "paid" : "attempted";
      return { requestId: id, razorpay_order_id: order.razorpayOrderId!, razorpay_payment_id: paymentId, razorpay_signature: createHmac("sha256", "fixture-secret").update(`${order.razorpayOrderId}|${paymentId}`).digest("hex") };
    },
    failGateway: () => { unavailable = true; },
    failCreation: () => { uncertainCreate = true; },
  };
}
