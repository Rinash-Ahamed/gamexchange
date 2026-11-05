import "server-only";
import nodemailer from "nodemailer";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { normalizedEmail } from "./notification-policy";
export function mailConfig() {
  const user = normalizedEmail(process.env.SMTP_USER);
  const pass = process.env.SMTP_PASS?.replace(/\s/g, "");
  const port = Number(process.env.SMTP_PORT ?? "465");
  const secure = (process.env.SMTP_SECURE ?? "true") === "true";
  if (!user || !pass || (process.env.SMTP_HOST?.trim() || "smtp.gmail.com") !== "smtp.gmail.com" || !((port === 465 && secure) || (port === 587 && !secure))) return null;
  return { user, pass, port, secure };
}
let logo: Promise<Buffer> | undefined;
export async function sendOrderMail(to: string, id: string, content: { subject: string; text: string; html: string }) {
  const config = mailConfig();
  if (!config) throw new Error("SMTP_NOT_CONFIGURED");
  const transport = nodemailer.createTransport({ host: "smtp.gmail.com", port: config.port, secure: config.secure, requireTLS: true, auth: { user: config.user, pass: config.pass }, connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000, disableFileAccess: true, disableUrlAccess: true });
  const image = await (logo ??= readFile(path.join(process.cwd(), "public/brand/gamexchange-logo-900.png")).catch((error: unknown) => { logo = undefined; throw error; }));
  return transport.sendMail({ from: { name: process.env.MAIL_FROM_NAME?.trim() || "GameXchange", address: config.user }, to, messageId: `<${id}@gamexchange.co.in>`, ...content, attachments: [{ filename: "gamexchange.png", content: image, cid: "gamexchange-logo", contentType: "image/png" }] });
}
