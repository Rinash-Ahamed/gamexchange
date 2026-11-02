import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { getFranchisePhoto, franchiseImageBytes } from "@/lib/admin/franchise";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const missing = () => NextResponse.json({ error: "Image not found." }, { status: 404, headers: { "Cache-Control": "no-store" } });
  try {
    const photo = await getFranchisePhoto((await params).id);
    if (!photo?.storagePath || request.nextUrl.searchParams.get("v") !== photo.version) return missing();
    if (photo.status !== "published" && !await getAdminSession()) return missing();
    return new Response(new Uint8Array(await franchiseImageBytes(photo)), { headers: { "Content-Type": "image/webp", "X-Content-Type-Options": "nosniff", "Cache-Control": photo.status === "published" ? "public, max-age=60" : "private, no-store" } });
  } catch { return missing(); }
}
