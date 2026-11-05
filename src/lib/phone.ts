import { z } from "zod";

/** Syntax only, not OTP verification. Keep one canonical number for abuse limits. */
export const indianMobileSchema = z.string({ error: "Enter your mobile number" })
  .max(24, "Enter a valid 10-digit Indian mobile number")
  .transform((value) => value.replace(/[\s-]/g, ""))
  .pipe(z.string().regex(/^(\+?91)?[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"))
  .transform((value) => value.slice(-10));
