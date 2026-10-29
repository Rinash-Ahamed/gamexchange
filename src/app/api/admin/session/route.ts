import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { AdminAccessError, adminAuthConfigured, checkAdminIdentity, createAdminSession } from "@/lib/admin/auth";
import { clientKey, isSameOrigin } from "@/lib/security";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const bodySchema = z.object({ idToken: z.string().min(1).max(16000), checkOnly: z.boolean().optional() });
const json = (body: object, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return json({ error: "Request not allowed." }, 403);
  const limit = rateLimit(`admin-session:${clientKey(request)}`, 20, 15 * 60 * 1000);
  if (!limit.ok) return json({ error: "Too many attempts. Please try again later." }, 429);
  if (!adminAuthConfigured()) return json({ error: "Admin authentication is not configured. Contact the site owner." }, 503);
  if (Number(request.headers.get("content-length")) > 20000) return json({ error: "Request too large." }, 413);
  let parsed;
  try { parsed = bodySchema.safeParse(await request.json()); }
  catch { return json({ error: "Invalid request." }, 400); }
  if (!parsed.success) return json({ error: "Invalid request." }, 400);
  try {
    if (parsed.data.checkOnly) return json({ ok: true, ...await checkAdminIdentity(parsed.data.idToken) });
    await createAdminSession(parsed.data.idToken);
    return json({ ok: true });
  } catch (error) {
    return json({ error: error instanceof AdminAccessError ? error.message : "Sign-in could not be verified. Please try again or contact the site owner." }, 401);
  }
}
