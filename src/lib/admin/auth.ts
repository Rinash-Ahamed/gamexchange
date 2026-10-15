import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "gamexchange_admin";
const SESSION_SECONDS = 60 * 60 * 8;
const DEV_EMAIL = "admin@gamexchange.local";
const DEV_PASSWORD = "change-me-now";
const DEV_SECRET = "gamexchange-development-session-secret-only";

type AdminSession = {
  email: string;
  expiresAt: number;
};

function credentials() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (email && password) return { email, password };
  if (process.env.NODE_ENV !== "production") return { email: DEV_EMAIL, password: DEV_PASSWORD };
  return null;
}

function sessionSecret() {
  const configured = process.env.ADMIN_SESSION_SECRET;
  if (configured && configured.length >= 32) return configured;
  if (process.env.NODE_ENV !== "production") return DEV_SECRET;
  return null;
}

function equalSecret(left: string, right: string) {
  const leftHash = createHash("sha256").update(left).digest();
  const rightHash = createHash("sha256").update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
}

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function adminAuthConfigured() {
  return Boolean(credentials() && sessionSecret());
}

export function developmentLoginHint() {
  if (process.env.NODE_ENV === "production" || process.env.ADMIN_EMAIL || process.env.ADMIN_PASSWORD) return null;
  return { email: DEV_EMAIL, password: DEV_PASSWORD };
}

export function verifyAdminCredentials(email: string, password: string) {
  const expected = credentials();
  if (!expected) return false;
  return equalSecret(email.trim().toLowerCase(), expected.email) && equalSecret(password, expected.password);
}

export async function createAdminSession(email: string) {
  const secret = sessionSecret();
  if (!secret) throw new Error("Admin session secret is not configured.");

  const session: AdminSession = {
    email: email.trim().toLowerCase(),
    expiresAt: Date.now() + SESSION_SECONDS * 1000,
  };
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const token = `${payload}.${sign(payload, secret)}`;
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const secret = sessionSecret();
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!secret || !token) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature || !equalSecret(signature, sign(payload, secret))) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AdminSession;
    const expected = credentials();
    if (!expected || session.email !== expected.email || session.expiresAt <= Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}
