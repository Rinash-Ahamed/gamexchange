import { NextResponse, type NextRequest } from "next/server";
import { imageSlot, readHomepageImageAssets, readHomepageAsset } from "@/lib/admin/homepage-images";
import { hasImageVersion } from "@/lib/image-request";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const missing = () => NextResponse.json({ error: "Image not found." }, { status: 404, headers: { "Cache-Control": "no-store" } });
  if (!hasImageVersion(request.nextUrl)) return missing();
  const { id } = await params;
  if (!imageSlot(id)) return missing();
  try {
    const asset = (await readHomepageImageAssets())[id];
    if (!asset || request.nextUrl.searchParams.get("v") !== asset.version) return missing();
    return new Response(new Uint8Array(await readHomepageAsset(asset)), { headers: { "Content-Type": "image/webp", "X-Content-Type-Options": "nosniff", "Cache-Control": "public, max-age=60" } });
  } catch { return missing(); }
}
