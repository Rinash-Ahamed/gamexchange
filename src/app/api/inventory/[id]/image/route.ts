import { type NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { getInventoryItem } from "@/lib/admin/db";
import { readInventoryImage } from "@/lib/admin/inventory-images";
import { inventoryPhotos } from "@/lib/inventory-photos";
import { isPublicInventory } from "@/lib/product-availability";
import { hasImageVersion } from "@/lib/image-request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!hasImageVersion(request.nextUrl)) return NextResponse.json({ error: "Image not found." }, { status: 404, headers: { "Cache-Control": "no-store" } });
  const { id } = await params;
  const item = await getInventoryItem(id);
  const notFound = () => NextResponse.json({ error: "Image not found." }, { status: 404, headers: { "Cache-Control": "no-store" } });
  if (!item) return notFound();
  const photo = inventoryPhotos(item).find((entry) => entry.imageStoragePath && request.nextUrl.searchParams.get("v") === entry.imageVersion);
  if (!photo) return notFound();
  const published = isPublicInventory(item);
  if (!published && !await getAdminSession()) return notFound();
  try {
    const data = await readInventoryImage(photo);
    return new Response(new Uint8Array(data), { headers: {
      "Content-Type": "image/webp", "X-Content-Type-Options": "nosniff",
      "Cache-Control": published ? "public, max-age=60" : "private, no-store",
    } });
  } catch { return notFound(); }
}
