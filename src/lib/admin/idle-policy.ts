export const ADMIN_IDLE_TIMEOUT_MS = 15 * 60 * 1000;
export const ADMIN_IDLE_WARNING_MS = 60 * 1000;
export const ADMIN_ACTIVITY_INTERVAL_MS = 30 * 1000;

export function adminIdleDeadline(lastActiveAt: number, expiresAt: number) {
  return Math.min(lastActiveAt + ADMIN_IDLE_TIMEOUT_MS, expiresAt);
}

export function adminIdleRecordValid(record: { uid?: unknown; lastActiveAt?: unknown; expiresAt?: unknown } | undefined, uid: string, now: number) {
  return Boolean(record && record.uid === uid
    && typeof record.lastActiveAt === "number" && Number.isFinite(record.lastActiveAt)
    && typeof record.expiresAt === "number" && Number.isFinite(record.expiresAt)
    && record.lastActiveAt <= now && now < adminIdleDeadline(record.lastActiveAt, record.expiresAt));
}
