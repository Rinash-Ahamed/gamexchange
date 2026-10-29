import "server-only";

/** Bounded LRU for immutable file bytes. Never store authorization or visibility here. */
export function createByteCache(maxBytes: number) {
  const entries = new Map<string, Buffer>();
  const pending = new Map<string, Promise<Buffer>>();
  let bytes = 0;

  function remove(key: string) {
    const entry = entries.get(key);
    if (!entry) return;
    bytes -= entry.length;
    entries.delete(key);
  }

  async function read(key: string, load: () => Promise<Buffer>): Promise<Buffer> {
    const cached = entries.get(key);
    if (cached) {
      entries.delete(key);
      entries.set(key, cached);
      return cached;
    }
    const running = pending.get(key);
    if (running) return running;

    const request = load().then((data) => {
      if (data.length <= maxBytes) {
        while (bytes + data.length > maxBytes) {
          const oldest = entries.keys().next().value;
          if (oldest === undefined) break;
          remove(oldest);
        }
        entries.set(key, data);
        bytes += data.length;
      }
      return data;
    }).finally(() => pending.delete(key));
    pending.set(key, request);
    return request;
  }

  return { read, remove };
}
