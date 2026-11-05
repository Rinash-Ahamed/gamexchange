export type Operation = "checkout.create" | "checkout.verify" | "checkout.webhook" | "email.worker";
export type RouteOperation = Operation | "enquiry" | "enquiry.token" | "admin.session";

/** Allowlisted event fields only. Never pass headers, URLs, errors, IDs or customer content. */
export async function observeRoute(operation: RouteOperation, run: () => Promise<Response>): Promise<Response> {
  const started = performance.now();
  let status = 500;
  try {
    const response = await run();
    status = response.status;
    response.headers.set("Server-Timing", `app;dur=${Math.max(0, performance.now() - started).toFixed(1)}`);
    return response;
  } finally {
    if (status >= 500 || process.env.PERFORMANCE_LOGGING === "true") {
      const event = JSON.stringify({ event: "request_result", operation, status, durationMs: Math.round(performance.now() - started) });
      if (status >= 500) console.error(event);
      else console.info(event);
    }
  }
}

export function reportRequestError(routeType: string) {
  const type = ["render", "route", "action", "proxy"].includes(routeType) ? routeType : "unknown";
  console.error(JSON.stringify({ event: "unhandled_request_error", routeType: type }));
}
