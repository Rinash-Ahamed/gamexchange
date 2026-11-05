import "server-only";
import { timingSafeEqual } from "node:crypto";

export function internalWorkerAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  const received = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret ?? ""}`;
  return Boolean(secret && secret.length >= 32 && Buffer.byteLength(received) === Buffer.byteLength(expected) && timingSafeEqual(Buffer.from(received), Buffer.from(expected)));
}
