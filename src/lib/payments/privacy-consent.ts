import { z } from "zod";

export const checkoutPrivacyNotice = {
  version: "2026-11-03-v1",
  href: "/policies/privacy-policy",
  text: "I consent to GameXchange using my account, contact and delivery details to prepare and support my order and arrange confirmed delivery, as explained in the Privacy Policy. This does not subscribe me to marketing.",
} as const;

export const checkoutPrivacyConsentSchema = z.object({
  accepted: z.literal(true),
  version: z.literal(checkoutPrivacyNotice.version),
});
