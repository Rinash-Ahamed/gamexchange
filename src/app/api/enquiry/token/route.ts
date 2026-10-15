import { NextResponse, type NextRequest } from "next/server";
import { issueToken, isSameOrigin, clientKey } from "@/lib/security";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Issues a short-lived signed token that a form must present when it submits. */
export function GET(req: NextRequest) {
  if (!isSameOrigin(req)) return NextResponse.json({ ok: false }, { status: 403 });
  const limit = rateLimit(`token:${clientKey(req)}`, 120, 10 * 60 * 1000);
  if (!limit.ok) return NextResponse.json({ ok: false }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  return NextResponse.json({ ok: true, token: issueToken() }, { headers: { "Cache-Control": "no-store" } });
}
