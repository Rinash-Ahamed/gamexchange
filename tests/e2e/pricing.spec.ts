import { expect, test } from "@playwright/test";
import { discountedPrice, productDiscount } from "@/lib/pricing";

test("discount preview calculates the final whole-rupee price", () => {
  expect(discountedPrice(10000, 20)).toBe(8000);
  expect(discountedPrice(999, 12.5)).toBe(874);
  expect(discountedPrice(10000, 0)).toBe(10000);
  expect(discountedPrice(10000, 100)).toBe(0);
});

test("customer savings use the saved final price and applied percentage", () => {
  expect(productDiscount({ price: 874, originalPrice: 999, discountPercent: 12.5 })).toMatchObject({ original: 999, saving: 125, percent: 12.5, label: "12.5" });
});

test("legacy discount prices survive an unchanged editor save", () => {
  for (const [originalPrice, price] of [[1999, 1500], [10000000, 9999999], [5000, 0]]) {
    const discount = productDiscount({ price: price!, originalPrice: originalPrice! });
    expect(discount).not.toBeNull();
    expect(discountedPrice(discount!.original, discount!.percent)).toBe(price);
  }
});

test("missing or invalid discounts do not advertise savings", () => {
  expect(productDiscount({ price: 8000 })).toBeNull();
  expect(productDiscount({ price: 8000, originalPrice: 8000 })).toBeNull();
  expect(productDiscount({ price: 8000, originalPrice: 7000 })).toBeNull();
  expect(productDiscount({ price: -1, originalPrice: 8000 })).toBeNull();
});

test("inconsistent stored percentages are derived from actual prices", () => {
  expect(productDiscount({ price: 8000, originalPrice: 10000, discountPercent: 80 })?.label).toBe("20");
  expect(productDiscount({ price: 9999999, originalPrice: 10000000 })?.label).toBe("<0.01");
});
