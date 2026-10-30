/** Choose from layout intent, never from window size during the hydration render. */
export function imageLoading(intent: "critical" | "visible" | "deferred") {
  if (intent === "critical") return { loading: "eager", fetchPriority: "high" } as const;
  if (intent === "visible") return { loading: "eager" } as const;
  return { loading: "lazy" } as const;
}
