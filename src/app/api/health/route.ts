import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Process liveness only. Never expose configuration or perform database writes. */
export function GET() {
  return NextResponse.json({ status: "ok", service: "gamexchange" }, {
    headers: { "Cache-Control": "no-store" },
  });
}
