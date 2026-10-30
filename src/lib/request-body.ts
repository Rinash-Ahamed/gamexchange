export class RequestBodyError extends Error {
  constructor(public readonly status: 400 | 413) { super(status === 413 ? "Request too large." : "Invalid request."); }
}

/** Enforce the byte limit while streaming, including chunked requests without Content-Length. */
export async function readLimitedText(request: Request, maxBytes: number): Promise<string> {
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxBytes) throw new RequestBodyError(413);
  if (!request.body) return "";
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let bytes = 0;
  let text = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) return text + decoder.decode();
      bytes += value.byteLength;
      if (bytes > maxBytes) {
        await reader.cancel().catch(() => undefined);
        throw new RequestBodyError(413);
      }
      text += decoder.decode(value, { stream: true });
    }
  } finally { reader.releaseLock(); }
}
