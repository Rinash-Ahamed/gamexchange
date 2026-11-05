import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { adminRecordPageSize, encodeRecordCursor, recordPageFormLocation, recordPageHref, recordPageRequest, recordPageResult, type RecordCursor, type RecordPageInput } from "../../src/lib/admin/record-cursor";

const createdAt = "2026-11-05T10:00:00.000Z";
const records = Array.from({ length: 55 }, (_, index) => ({ createdAt, id: `record-${String(55 - index).padStart(3, "0")}` }));
function simulate(input: RecordPageInput, dataset = records) {
  const request = recordPageRequest("orders", input);
  const cursor = request.cursor;
  const compare = (a: RecordCursor, b: RecordCursor) => a.createdAt === b.createdAt ? (a.id === b.id ? 0 : a.id > b.id ? -1 : 1) : a.createdAt > b.createdAt ? -1 : 1;
  const matching = cursor ? dataset.filter((record) => request.direction === "older" ? compare(record, cursor) > 0 : compare(record, cursor) < 0) : dataset;
  const queried = request.direction === "newer" ? matching.slice(-(adminRecordPageSize + 1)) : matching.slice(0, adminRecordPageSize + 1);
  return recordPageResult("orders", request, queried);
}

test("cursor pages visit tied timestamps without overlap, omissions or a fifty-order ceiling", () => {
  const first = simulate({});
  const second = simulate({ after: first.older! });
  const third = simulate({ after: second.older! });
  expect(first.items).toHaveLength(20);
  expect(second.items).toHaveLength(20);
  expect(third.items).toHaveLength(15);
  expect([...first.items, ...second.items, ...third.items]).toEqual(records);
  expect(first.newer).toBeNull();
  expect(third.older).toBeNull();
  expect(simulate({ before: third.newer! }).items).toEqual(second.items);
  const back = simulate({ before: second.newer! });
  expect(back.items).toEqual(first.items);
  expect(back.newer).toBeNull();
});

test("cursor boundaries tolerate new records and deletion of the anchor document", () => {
  const first = simulate({});
  const newer = { createdAt: "2026-11-06T10:00:00.000Z", id: "new-order" };
  const anchor = first.items.at(-1)!;
  const changed = [newer, ...records.filter((record) => record.id !== anchor.id)];
  expect(simulate({ after: first.older! }, changed).items).toEqual(records.slice(20, 40));
});

test("malformed, repeated, oversized and cross-screen cursors reset safely", () => {
  const token = encodeRecordCursor("orders", records[0]!);
  for (const input of [{ after: "bad" }, { after: "" }, { after: "x".repeat(513) }, { after: [token, token] }, { after: token, before: token }]) {
    const result = recordPageRequest("orders", input);
    expect(result.invalid).toBe(true);
    expect(result.location).toEqual({});
    expect(result.direction).toBe("first");
  }
  expect(recordPageRequest("services", { after: token }).invalid).toBe(true);
});

test("edit return links preserve only validated pagination and remain inside admin", () => {
  const token = encodeRecordCursor("services", records[1]!);
  const form = new FormData();
  form.set("pageAfter", token);
  expect(recordPageFormLocation("services", form)).toEqual({ after: token });
  const url = new URL(recordPageHref("services", { after: token }, { notice: "updated" }), "https://example.com");
  expect(url.pathname).toBe("/admin/services");
  expect(url.searchParams.get("after")).toBe(token);
  expect(url.searchParams.get("notice")).toBe("updated");
  expect(recordPageHref("services", { after: "https://evil.invalid" })).toBe("/admin/services");
});

test("empty/deleted ranges recover without inventing totals or navigation", () => {
  const request = recordPageRequest("orders", { after: encodeRecordCursor("orders", records.at(-1)!) });
  const page = recordPageResult("orders", request, []);
  expect(page.items).toEqual([]);
  expect(page.newer).toBeNull();
  expect(page.older).toBeNull();
  expect(page.location.after).toBeTruthy();
});

test("private query uses bounded keysets and never offsets or public catalogue helpers", () => {
  const source = readFileSync("src/lib/admin/record-pages.ts", "utf8");
  expect(source).toContain("await requireAdmin()");
  expect(source).toContain('orderBy(FieldPath.documentId(), "desc")');
  expect(source).toContain("startAfter(");
  expect(source).toContain("endBefore(");
  expect(source).toContain("limitToLast(adminRecordPageSize + 1)");
  expect(source).toContain("limit(adminRecordPageSize + 1)");
  expect(source).not.toContain(".offset(");
  expect(source).not.toContain("listPublicProducts");
});
