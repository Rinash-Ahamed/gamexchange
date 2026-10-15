export const inventoryStatuses = ["active", "draft", "out-of-stock"] as const;
export type InventoryStatus = (typeof inventoryStatuses)[number];

export const serviceStatuses = [
  "received",
  "diagnosing",
  "awaiting-approval",
  "in-repair",
  "ready",
  "completed",
  "cancelled",
] as const;
export type ServiceStatus = (typeof serviceStatuses)[number];

export type InventoryItem = {
  id: string;
  sku: string;
  name: string;
  platform: string;
  category: string;
  condition: string;
  stock: number;
  price: number;
  tradeInVoucher: number;
  tradeInCash: number;
  imageSrc: string;
  imageWidth: number;
  imageHeight: number;
  featured: boolean;
  status: InventoryStatus;
  createdAt: string;
  updatedAt: string;
};

export type ServiceRecord = {
  id: string;
  ticketNumber: string;
  customerName: string;
  phone: string;
  device: string;
  issue: string;
  status: ServiceStatus;
  estimatedCost: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type DashboardStats = {
  inventoryItems: number;
  unitsInStock: number;
  lowStockItems: number;
  openServices: number;
  readyServices: number;
};
