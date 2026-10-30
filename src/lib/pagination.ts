export const SHOP_PAGE_SIZE = 20;

export function paginate<T>(items: readonly T[], requestedPage: number, pageSize = SHOP_PAGE_SIZE) {
  const size = Number.isFinite(pageSize) ? Math.max(1, Math.floor(pageSize)) : SHOP_PAGE_SIZE;
  const pageCount = Math.ceil(items.length / size);
  const requested = Number.isFinite(requestedPage) ? Math.floor(requestedPage) : 1;
  const page = Math.min(Math.max(1, requested), Math.max(1, pageCount));
  const offset = (page - 1) * size;
  return { items: items.slice(offset, offset + size), page, pageCount, from: items.length ? offset + 1 : 0, to: Math.min(offset + size, items.length), total: items.length };
}

/** First/last and nearby page links, without rendering hundreds of buttons. */
export function paginationLinks(page: number, pageCount: number): (number | "gap-start" | "gap-end")[] {
  if (pageCount <= 0) return [];
  if (pageCount <= 5) return Array.from({ length: pageCount }, (_, index) => index + 1);
  const current = Math.min(Math.max(1, page), pageCount);
  const candidates = [...new Set([1, pageCount, current - 1, current, current + 1])].filter((value) => value >= 1 && value <= pageCount).sort((a, b) => a - b);
  const result: (number | "gap-start" | "gap-end")[] = [];
  for (const candidate of candidates) {
    const previous = result.at(-1);
    if (typeof previous === "number" && candidate - previous === 2) result.push(previous + 1);
    else if (typeof previous === "number" && candidate - previous > 2) result.push(candidate < current ? "gap-start" : "gap-end");
    result.push(candidate);
  }
  return result;
}
