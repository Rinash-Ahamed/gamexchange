export const formatAdminDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));

export const titleCaseStatus = (value: string) =>
  value.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");

/** Human-readable labels for saved activity fields, without changing stored history. */
export function adminFieldLabel(value: string) {
  const labels: Record<string, string> = {
    sku: "SKU", serviceRecords: "Service records", categoryId: "Category reference",
    imageSrc: "Image", imageStoragePath: "Uploaded image", imageVersion: "Image version",
    originalPrice: "Price before discount", price: "Selling price", estimatedCost: "Estimated cost",
    discountPercent: "Discount (%)", actorUid: "Administrator reference",
  };
  return labels[value] ?? titleCaseStatus(value.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/_/g, "-").toLowerCase()).replace(/\bId\b/g, "reference");
}
