import { timingSafeEqual } from "node:crypto";
import { dispatchOrderEmails } from "@/lib/orders/outbox";
import { observeRoute } from "@/lib/observability";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
export async function GET(request: Request) {
  return observeRoute("email.worker", async () => {
    const secret = process.env.CRON_SECRET?.trim();
    const received = request.headers.get("authorization") ?? "";
    const expected = `Bearer ${secret ?? ""}`;
    if (!secret || secret.length < 32 || Buffer.byteLength(received) !== Buffer.byteLength(expected) || !timingSafeEqual(Buffer.from(received), Buffer.from(expected))) return Response.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
    const result = await dispatchOrderEmails();
    return Response.json(result, { status: result.ok ? 200 : 503, headers: { "Cache-Control": "no-store" } });
  });
}
