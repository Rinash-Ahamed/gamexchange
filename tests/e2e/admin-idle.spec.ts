import { expect, test } from "@playwright/test";
import { ADMIN_IDLE_TIMEOUT_MS, adminIdleDeadline, adminIdleRecordValid } from "../../src/lib/admin/idle-policy";

test.describe("admin idle policy", () => {
  const started = 1_800_000_000_000;
  const record = { uid: "admin-fixture", lastActiveAt: started, expiresAt: started + 8 * 60 * 60 * 1000 };

  test("expires at exactly 15 minutes, not on a background status read", () => {
    expect(ADMIN_IDLE_TIMEOUT_MS).toBe(15 * 60 * 1000);
    expect(adminIdleRecordValid(record, record.uid, started + ADMIN_IDLE_TIMEOUT_MS - 1)).toBe(true);
    expect(adminIdleRecordValid(record, record.uid, started + ADMIN_IDLE_TIMEOUT_MS)).toBe(false);
    expect(adminIdleRecordValid(record, record.uid, started + ADMIN_IDLE_TIMEOUT_MS + 1)).toBe(false);
    expect(record.lastActiveAt).toBe(started);
  });

  test("activity extends idle time but never the eight-hour maximum", () => {
    expect(adminIdleDeadline(started + 60_000, record.expiresAt)).toBe(started + 60_000 + ADMIN_IDLE_TIMEOUT_MS);
    expect(adminIdleDeadline(record.expiresAt - 1000, record.expiresAt)).toBe(record.expiresAt);
    expect(adminIdleRecordValid({ ...record, lastActiveAt: record.expiresAt - 1000 }, record.uid, record.expiresAt)).toBe(false);
  });

  test("missing, foreign, future and malformed records fail closed", () => {
    expect(adminIdleRecordValid(undefined, record.uid, started)).toBe(false);
    expect(adminIdleRecordValid(record, "different-admin", started)).toBe(false);
    expect(adminIdleRecordValid({ ...record, lastActiveAt: started + 1 }, record.uid, started)).toBe(false);
    for (const invalid of [NaN, Infinity, "1800000000000", undefined]) {
      expect(adminIdleRecordValid({ ...record, lastActiveAt: invalid }, record.uid, started)).toBe(false);
      expect(adminIdleRecordValid({ ...record, expiresAt: invalid }, record.uid, started)).toBe(false);
    }
  });
});
