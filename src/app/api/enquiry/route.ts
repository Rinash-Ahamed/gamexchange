import { observeRoute } from "@/lib/observability";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { enquirySchema } from "@/lib/validation";
import { buildEnquiryMessage } from "@/lib/enquiry-message";
import { rateLimit } from "@/lib/rate-limit";
import { clientKey, isSameOrigin, verifyToken } from "@/lib/security";
import { whatsappUrl } from "@/data/site";
import { readLimitedText, RequestBodyError } from "@/lib/request-body";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 8 * 1024;
const fail = (error: string, status: number, extra: Record<string, unknown> = {}, headers?: HeadersInit) =>
  NextResponse.json({ ok: false, error, ...extra }, { status, headers: { "Cache-Control": "no-store", ...headers } });

export async function POST(req: NextRequest) {
  return observeRoute("enquiry", async () => {
    if (!isSameOrigin(req)) return fail("Cross-origin requests are not allowed.", 403);
    if (!req.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return fail("Unsupported content type.", 415);

    const declared = Number(req.headers.get("content-length"));
    if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) return fail("Enquiry is too large.", 413);

    // Cheap guards first: per-client, then a global valve so a botnet can't spam the pipeline.
    const ip = clientKey(req);
    const perIp = await rateLimit(`enquiry:${ip}`, ip === "unknown" ? 40 : 6, 10 * 60 * 1000);
    if (perIp.unavailable) return fail("Enquiries are temporarily unavailable. Please try again shortly.", 503);
    if (!perIp.ok) return fail("Too many enquiries. Please wait a few minutes and try again.", 429, {}, { "Retry-After": String(perIp.retryAfter) });
    const global = await rateLimit("enquiry:global", 300, 10 * 60 * 1000);
    if (global.unavailable) return fail("Enquiries are temporarily unavailable. Please try again shortly.", 503);
    if (!global.ok) return fail("We’re busy right now. Please try again shortly.", 429, {}, { "Retry-After": "120" });

    let json: unknown;
    try {
      json = JSON.parse(await readLimitedText(req, MAX_BODY_BYTES));
    } catch (error) {
      if (error instanceof RequestBodyError && error.status === 413) return fail("Enquiry is too large.", 413);
      return fail("Invalid request.", 400);
    }
    if (typeof json !== "object" || json === null || Array.isArray(json)) return fail("Invalid request.", 400);

    const { _t: token, ...body } = json as Record<string, unknown>;
    const tokenState = await verifyToken(token);
    if (tokenState === "unavailable") return fail("Enquiries are temporarily unavailable. Please try again shortly.", 503);
    if (tokenState !== "ok") {
      const msg = tokenState === "too-fast" ? "That was quick. Please review your details and send again." : "Your session expired. Please reload the page and try again.";
      return fail(msg, tokenState === "too-fast" ? 429 : 400, { retry: true });
    }

    const parsed = enquirySchema.safeParse(body);
    if (!parsed.success) return fail("Please fix the highlighted fields.", 400, { fieldErrors: z.flattenError(parsed.error).fieldErrors });

    // Honeypot: people never see this field. Answer like success so bots learn nothing.
    if (parsed.data.website) return NextResponse.json({ ok: true, whatsappUrl: whatsappUrl() }, { headers: { "Cache-Control": "no-store" } });

    // One phone number can't flood the shop even from many IPs.
    const phoneLimit = await rateLimit(`phone:${parsed.data.phone}`, 3, 60 * 60 * 1000);
    if (phoneLimit.unavailable) return fail("Enquiries are temporarily unavailable. Please try again shortly.", 503);
    if (!phoneLimit.ok) {
      return fail("We already have several enquiries from this number. Please message the shop on WhatsApp directly.", 429);
    }

    // No booking backend exists yet: the enquiry is delivered when the customer sends this message.
    return NextResponse.json({ ok: true, whatsappUrl: whatsappUrl(buildEnquiryMessage(parsed.data)) }, { headers: { "Cache-Control": "no-store" } });
  });
}
