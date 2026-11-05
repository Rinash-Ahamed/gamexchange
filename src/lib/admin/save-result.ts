export type AdminSaveResult = { error: string; redirectTo?: never } | { redirectTo: string; error?: never };

export const inventoryErrors: Record<string, string> = {
  conflict: "This item changed in another editor. Your entries are still here. Reopen the latest item before saving again.",
  invalid: "Check the submitted values, including price, discount and required fields. Your entries have been kept.",
  duplicate: "That SKU is already in use. Your entries have been kept.",
  category: "That category changed or was deleted. Review the available categories before saving again.",
  image: "Use 1 to 5 JPG, PNG or WebP photos, 300 to 4096 pixels per side, up to 4 MB total per save.",
  storage: "Image upload failed. Your entries and selected photos are still here. Please try again or contact support.",
  save: "Could not confirm this change. Your entries are still here. Check inventory before retrying to avoid a duplicate.",
};
