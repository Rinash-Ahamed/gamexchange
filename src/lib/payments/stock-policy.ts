/** Isolated sandbox counters. Never write these values into the public inventory. */
export type TestStock = { capacity: number; held: number; sold: number };
export const reservationDurationMs = 10 * 60_000;

export function changeTestStock(stock: TestStock, quantity: number, operation: "hold" | "release" | "consume-held" | "consume-free", ceiling = stock.capacity): TestStock | null {
  if (![stock.capacity, stock.held, stock.sold, quantity, ceiling].every(Number.isSafeInteger) || stock.capacity < 0 || stock.held < 0 || stock.sold < 0 || quantity <= 0 || ceiling < 0 || stock.held + stock.sold > stock.capacity) throw new Error("Invalid sandbox stock counters.");
  const available = Math.min(stock.capacity, ceiling) - stock.held - stock.sold;
  if ((operation === "hold" || operation === "consume-free") && available < quantity) return null;
  if ((operation === "release" || operation === "consume-held") && stock.held < quantity) throw new Error("Sandbox reservation counters need review.");
  return {
    capacity: stock.capacity,
    held: stock.held + (operation === "hold" ? quantity : operation === "release" || operation === "consume-held" ? -quantity : 0),
    sold: stock.sold + (operation === "consume-held" || operation === "consume-free" ? quantity : 0),
  };
}
