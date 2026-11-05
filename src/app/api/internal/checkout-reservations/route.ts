import { internalWorkerAuthorized } from "@/lib/internal-worker";
import { reconcileTestReservations } from "@/lib/payments/orders";
import { observeRoute } from "@/lib/observability";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  return observeRoute("checkout.reservations", async () => {
    if (!internalWorkerAuthorized(request)) return Response.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
    const result = await reconcileTestReservations();
    return Response.json(result, { status: result.ok ? 200 : 503, headers: { "Cache-Control": "no-store" } });
  });
}
