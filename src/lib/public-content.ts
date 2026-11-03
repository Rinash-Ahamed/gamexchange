import "server-only";

/** Optional managed sections must not reject the entire public page. Never substitute stock. */
export async function optionalPublicContent<T>(resource: string, read: () => Promise<T>): Promise<T | null> {
  try {
    return await read();
  } catch {
    // Keep provider exceptions/credentials out of rendered content and public responses.
    console.error(`[public-content] ${resource} unavailable`);
    return null;
  }
}
