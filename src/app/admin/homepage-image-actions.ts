"use server";
import { requireAdmin } from "@/lib/admin/auth";
import { imageSlot, saveHomepageImage } from "@/lib/admin/homepage-images";
import { formFile, formText } from "@/lib/admin/form-data";
import { refreshAdminData } from "@/lib/admin/revalidate";
export type HomepageImageState = { error?: string; message?: string; saved?: number };
export async function saveHomepageImageAction(_previous: HomepageImageState, data: FormData): Promise<HomepageImageState> {
  await requireAdmin();
  const id = formText(data, "id");
  if (!imageSlot(id)) return { error: "Unknown card. Refresh the page." };
  const reset = formText(data, "reset") === "true";
  try { await saveHomepageImage(id, formFile(data, "image"), reset); }
  catch (error) { return { error: error instanceof Error ? error.message : "Could not save the image." }; }
  refreshAdminData("homepageImages");
  return { message: reset ? "Original image restored." : "Image updated. Changes appear on the next homepage visit or refresh.", saved: Date.now() };
}
