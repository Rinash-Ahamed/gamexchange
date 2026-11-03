import { NextResponse, type NextRequest } from "next/server";
import { issueToken, isSameOrigin, clientKey } from "@/lib/security";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Issues a short-lived signed token that a form must present when it submits. */
export async function GET(req: NextRequest) {
  if (!isSameOrigin(req)) return NextResponse.json({ ok: false }, { status: 403, headers: { "Cache-Control": "no-store" } });
  const limit = await rateLimit(`token:${clientKey(req)}`, 120, 10 * 60 * 1000);
  if (!limit.ok) return NextResponse.json({ ok: false }, { status: limit.unavailable ? 503 : 429, headers: { "Cache-Control": "no-store", "Retry-After": String(limit.retryAfter) } });
  try { return NextResponse.json({ ok: true, token: issueToken() }, { headers: { "Cache-Control": "no-store" } }); }
  catch { return NextResponse.json({ ok: false }, { status: 503, headers: { "Cache-Control": "no-store" } }); }
}
