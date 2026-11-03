import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession, recordAdminActivity } from "@/lib/admin/auth";
import { ADMIN_ACTIVITY_INTERVAL_MS } from "@/lib/admin/idle-policy";
import { isSameOrigin } from "@/lib/security";

export const runtime = "nodejs";
const json = (body: object, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store" } });

// Reading status, prefetching and background requests never extend the idle deadline.
export async function GET() {
  const session = await getAdminSession();
  return session ? json({ idleExpiresAt: session.idleExpiresAt, serverNow: Date.now() }) : json({ error: "Sign in required." }, 401);
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return json({ error: "Request not allowed." }, 403);
  // A bounded header avoids parsing a body. The server never accepts future activity.
  const idleForMs = Number(request.headers.get("x-admin-idle-ms"));
  if (!request.headers.has("x-admin-idle-ms") || !Number.isFinite(idleForMs) || idleForMs < 0 || idleForMs > ADMIN_ACTIVITY_INTERVAL_MS) {
    return json({ error: "Invalid activity." }, 400);
  }
  try {
    const idleExpiresAt = await recordAdminActivity(idleForMs);
    return idleExpiresAt ? json({ idleExpiresAt, serverNow: Date.now() }) : json({ error: "Sign in required." }, 401);
  } catch {
    return json({ error: "Session could not be refreshed." }, 503);
  }
}
