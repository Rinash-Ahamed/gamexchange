import type { Instrumentation } from "next";
import { reportRequestError } from "@/lib/observability";

// Deliberately omit the error, path, headers and request body, which may contain private data.
export const onRequestError: Instrumentation.onRequestError = (_error, _request, context) => {
  reportRequestError(context.routeType);
};
