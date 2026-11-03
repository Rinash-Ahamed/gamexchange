import { z } from "zod";

const text = (min: number, max: number) => z.string().trim().min(min).max(max).refine((value) => [...value].every((character) => character.charCodeAt(0) >= 32 && character.charCodeAt(0) !== 127), "Use a single line of text.");
export const shippingSchema = z.object({
  name: text(2, 100),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number."),
  addressLine1: text(5, 180),
  addressLine2: text(0, 180).default(""),
  city: text(2, 80),
  state: text(2, 80),
  postalCode: z.string().trim().regex(/^[1-9]\d{5}$/, "Enter a valid 6-digit PIN code."),
  country: z.literal("IN"),
});
export type ShippingAddress = z.infer<typeof shippingSchema>;
export type CheckoutCustomer = { uid: string; email: string };
