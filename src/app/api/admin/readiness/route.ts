import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { adminReadiness } from "@/lib/admin/readiness";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  const headers = { "Cache-Control": "private, no-store" };
  if (!await getAdminSession()) return NextResponse.json({ error: "Sign in required." }, { status: 401, headers });
  const result = await adminReadiness();
  return NextResponse.json(result, { status: result.ready ? 200 : 503, headers });
}
