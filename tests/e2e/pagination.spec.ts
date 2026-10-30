import { expect, test } from "@playwright/test";
import { paginate, paginationLinks } from "@/lib/pagination";

test("shop pagination shows 20 distinct products per page", () => {
  const products = Array.from({ length: 43 }, (_, index) => index + 1);
  expect(paginate(products, 1)).toMatchObject({ from: 1, to: 20, total: 43, pageCount: 3 });
  expect(paginate(products, 2)).toMatchObject({ from: 21, to: 40, page: 2 });
  expect(paginate(products, 3).items).toEqual([41, 42, 43]);
});

test("pagination safely clamps pages after stock or filters shrink", () => {
  expect(paginate([1, 2], 50)).toMatchObject({ page: 1, pageCount: 1, from: 1, to: 2 });
  expect(paginate([], 50)).toMatchObject({ page: 1, pageCount: 0, from: 0, to: 0, items: [] });
  expect(paginate([1, 2], Number.NaN).page).toBe(1);
});

test("large page counts keep first, last and nearby pages without an oversized control", () => {
  expect(paginationLinks(1, 3)).toEqual([1, 2, 3]);
  expect(paginationLinks(50, 100)).toEqual([1, "gap-start", 49, 50, 51, "gap-end", 100]);
  expect(paginationLinks(1, 0)).toEqual([]);
});
