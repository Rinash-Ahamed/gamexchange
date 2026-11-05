export const adminRecordPageSize = 20;
export type AdminRecordScope = "orders" | "services";
export type RecordPageLocation = { after?: string; before?: string };
export type RecordPageInput = { after?: string | string[]; before?: string | string[] };
export type RecordCursor = { createdAt: string; id: string };
export type RecordPageRequest = { cursor: RecordCursor | null; direction: "first" | "older" | "newer"; location: RecordPageLocation; invalid: boolean };

function validCursor(value: unknown): value is RecordCursor {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<RecordCursor>;
  return typeof entry.id === "string" && /^[a-zA-Z0-9-]{1,128}$/.test(entry.id) &&
    typeof entry.createdAt === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?Z$/.test(entry.createdAt) && Number.isFinite(Date.parse(entry.createdAt));
}

export function encodeRecordCursor(scope: AdminRecordScope, cursor: RecordCursor) {
  if (!validCursor(cursor)) throw new Error("Invalid record cursor.");
  // No customer details or bearer tokens. Cursor is a position, never an authorization token.
  return Buffer.from(JSON.stringify([1, scope, cursor.createdAt, cursor.id])).toString("base64url");
}

function decodeRecordCursor(value: string, scope: AdminRecordScope): RecordCursor | null {
  if (value.length > 512 || !/^[a-zA-Z0-9_-]+$/.test(value)) return null;
  try {
    const data: unknown = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
    if (!Array.isArray(data) || data.length !== 4 || data[0] !== 1 || data[1] !== scope) return null;
    const cursor = { createdAt: data[2], id: data[3] };
    return validCursor(cursor) ? cursor : null;
  } catch { return null; }
}

export function recordPageRequest(scope: AdminRecordScope, input: RecordPageInput): RecordPageRequest {
  const first: RecordPageRequest = { cursor: null, direction: "first", location: {}, invalid: false };
  if (input.after === undefined && input.before === undefined) return first;
  if (Array.isArray(input.after) || Array.isArray(input.before) || (input.after !== undefined && input.before !== undefined)) return { ...first, invalid: true };
  const token = input.after ?? input.before ?? "";
  const cursor = decodeRecordCursor(token, scope);
  if (!cursor) return { ...first, invalid: true };
  return { cursor, direction: input.after !== undefined ? "older" : "newer", location: input.after !== undefined ? { after: token } : { before: token }, invalid: false };
}

export function recordPageHref(scope: AdminRecordScope, location: RecordPageLocation, extra: Partial<Record<"order" | "notice" | "error" | "saved", string>> = {}) {
  const safe = recordPageRequest(scope, location).location;
  const query = new URLSearchParams();
  if (safe.after) query.set("after", safe.after);
  if (safe.before) query.set("before", safe.before);
  for (const key of ["order", "notice", "error", "saved"] as const) {
    const value = extra[key];
    if (value !== undefined) query.set(key, value);
  }
  return `/admin/${scope}${query.size ? `?${query}` : ""}`;
}

export function recordPageFormLocation(scope: AdminRecordScope, form: FormData): RecordPageLocation {
  const after = form.get("pageAfter");
  const before = form.get("pageBefore");
  return recordPageRequest(scope, { ...(typeof after === "string" && after ? { after } : {}), ...(typeof before === "string" && before ? { before } : {}) }).location;
}

/** Accept at most the query's 20 records + one lookahead, preserving database ordering. */
export function recordPageResult<T extends RecordCursor>(scope: AdminRecordScope, page: RecordPageRequest, records: readonly T[]) {
  const extra = records.length > adminRecordPageSize;
  const items = page.direction === "newer" && extra ? records.slice(-adminRecordPageSize) : records.slice(0, adminRecordPageSize);
  const first = items[0];
  const last = items.at(-1);
  const hasNewer = page.direction === "newer" ? extra : page.direction === "older";
  const hasOlder = page.direction === "newer" ? true : extra;
  return { items, location: page.location, invalid: page.invalid,
    newer: first && hasNewer ? encodeRecordCursor(scope, first) : null,
    older: last && hasOlder ? encodeRecordCursor(scope, last) : null,
  };
}
