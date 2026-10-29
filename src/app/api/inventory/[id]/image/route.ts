import { type NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { getInventoryItem } from "@/lib/admin/db";
import { readInventoryImage } from "@/lib/admin/inventory-images";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getInventoryItem(id);
  const notFound = () => NextResponse.json({ error: "Image not found." }, { status: 404, headers: { "Cache-Control": "no-store" } });
  if (!item?.imageStoragePath || request.nextUrl.searchParams.get("v") !== item.imageVersion) return notFound();
  const published = item.status === "active" && item.stock > 0;
  if (!published && !await getAdminSession()) return notFound();
  try {
    const data = await readInventoryImage(item);
    return new Response(new Uint8Array(data), { headers: {
      "Content-Type": "image/webp", "X-Content-Type-Options": "nosniff",
      "Cache-Control": published ? "public, max-age=60" : "private, no-store",
    } });
  } catch { return notFound(); }
}
