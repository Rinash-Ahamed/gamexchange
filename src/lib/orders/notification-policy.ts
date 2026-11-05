import { z } from "zod";
import type { OrderEmailKind } from "./email-template";

export const normalizedEmail = (value: string | undefined) => {
  const parsed = z.email().safeParse(value?.trim().toLowerCase());
  return parsed.success ? parsed.data : "";
};
export const orderEmailId = (orderId: string, kind: OrderEmailKind) => `${orderId}-${kind}`;
export const canRetryEmail = (status: string) => ["pending", "failed", "blocked"].includes(status);
function mailboxKey(value: string | undefined) {
  const address = normalizedEmail(value);
  const [local, domain] = address.split("@");
  // Gmail aliases reach the same inbox; do not apply provider-specific rules to other domains.
  return domain === "gmail.com" || domain === "googlemail.com" ? `${local!.split("+")[0]!.replace(/\./g, "")}@gmail.com` : address;
}
export const sameMailbox = (first: string | undefined, second: string | undefined) => {
  const address = mailboxKey(first);
  return !!address && address === mailboxKey(second);
};
