export const orderStages = ["Order Placed", "Packed", "Parcel Sent", "Delivered"] as const;
export type OrderStage = typeof orderStages[number];
export type Shipment = { carrier: string; trackingNumber: string; trackingUrl: string };
export type OrderHistory = { status: OrderStage; at: string; actor: string };
export type OrderTracking = {
  fulfillmentStatus?: OrderStage;
  history?: OrderHistory[];
  paidAt?: string;
  shipment?: Shipment;
};
export function nextOrderStage(stage: OrderStage) {
  return orderStages[orderStages.indexOf(stage) + 1];
}
