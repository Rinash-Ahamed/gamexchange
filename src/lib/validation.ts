import { z } from "zod";
import { repairCategories, repairFaults, repairDevices, exchangeConsoles, exchangeConditions, exchangeAccessories, exchangeUpgrades } from "@/data/repair";

/** Single-line text: control characters (incl. CR/LF) become spaces, runs collapse. */
const oneLine = (v: string) => v.replace(/[\u0000-\u001f\u007f\u2028\u2029]/g, " ").replace(/\s+/g, " ").trim();
/** Multi-line text: normalise newlines, drop other control characters, cap blank runs. */
const multiLine = (v: string) => v.replace(/\r\n?/g, "\n").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u2028\u2029]/g, "").replace(/\n{3,}/g, "\n\n").trim();

const contactMethods = ["WhatsApp", "Phone call"] as const;
const branchChoices = ["No preference", "Branch 1 – Sungam", "Branch 2 – Selvapuram South"] as const;

const name = z.string({ error: "Enter your name" }).transform(oneLine).pipe(z.string().min(2, "Enter your name").max(80, "Name is too long"));
const phone = z
  .string({ error: "Enter your mobile number" })
  .transform((v) => v.replace(/[\s-]/g, ""))
  .pipe(z.string().regex(/^(\+?91)?[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"));
const contactMethod = z.enum(contactMethods, { error: "Choose how we should reach you" });
const branch = z.enum(branchChoices).default("No preference");
const honeypot = z.string().max(200).optional();

const common = { name, phone, contactMethod, website: honeypot };

export const repairSchema = z
  .object({
    kind: z.literal("repair"),
    ...common,
    category: z.enum(repairCategories, { error: "Choose a device category" }),
    device: z.string({ error: "Choose your device" }).transform(oneLine).pipe(z.string().min(1, "Choose your device")),
    fault: z.enum(repairFaults, { error: "Choose the closest issue" }),
    details: z.string({ error: "Tell us a little more" }).transform(multiLine).pipe(z.string().min(10, "Tell us a little more (10+ characters)").max(1000, "Keep it under 1000 characters")),
    branch,
  })
  .refine((v) => repairDevices[v.category].includes(v.device), { path: ["device"], message: "Choose a device from the list" });

export const exchangeSchema = z.object({
  kind: z.literal("exchange"),
  ...common,
  console: z.enum(exchangeConsoles, { error: "Choose your console" }),
  condition: z.enum(exchangeConditions, { error: "Choose its condition" }),
  accessories: z.array(z.enum(exchangeAccessories)).max(exchangeAccessories.length),
  details: z.string().transform(multiLine).pipe(z.string().max(1000, "Keep it under 1000 characters")).default(""),
  upgrade: z.enum(exchangeUpgrades, { error: "Choose what you’d like to upgrade to" }),
  branch,
});

export const zoneSchema = z.object({
  kind: z.literal("gamezone"),
  ...common,
  station: z.enum(["PlayStation 4", "PlayStation 5", "Arcade Tekken Tournament", "Not sure yet"], { error: "Choose a station" }),
  people: z.coerce.number({ error: "Enter a number" }).int().min(1, "At least 1 player").max(20, "For groups above 20, message us"),
  when: z.string({ error: "Tell us when you’d like to come" }).transform(oneLine).pipe(z.string().min(3, "Tell us when you’d like to come").max(80)),
  message: z.string().transform(multiLine).pipe(z.string().max(500, "Keep it under 500 characters")).default(""),
  branch,
});

export const contactSchema = z.object({
  kind: z.literal("contact"),
  ...common,
  message: z.string({ error: "Tell us a little more" }).transform(multiLine).pipe(z.string().min(10, "Tell us a little more (10+ characters)").max(1000, "Keep it under 1000 characters")),
  branch,
});

export const enquirySchema = z.discriminatedUnion("kind", [repairSchema, exchangeSchema, zoneSchema, contactSchema]);

export type EnquiryInput = z.input<typeof enquirySchema>;
export type Enquiry = z.output<typeof enquirySchema>;
export type EnquiryKind = Enquiry["kind"];
export { contactMethods, branchChoices };
