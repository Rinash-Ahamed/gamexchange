export type ProductPricing = { price: number; originalPrice?: number; discountPercent?: number };

/** Inventory uses whole INR amounts. Keep preview, persistence and checkout prices consistent. */
export function discountedPrice(basePrice: number, percent: number) {
  return Math.round(basePrice * (100 - percent) / 100);
}

export function productDiscount(product: ProductPricing) {
  const original = product.originalPrice ?? 0;
  if (!Number.isFinite(original) || !Number.isFinite(product.price) || original <= product.price || product.price < 0) return null;
  const requested = product.discountPercent;
  const percent = requested !== undefined && Number.isFinite(requested) && requested > 0 && requested <= 100 && discountedPrice(original, requested) === product.price
    ? requested : (original - product.price) / original * 100;
  return { original, saving: original - product.price, percent, label: percent < 0.01 ? "<0.01" : String(Number(percent.toFixed(2))) };
}
