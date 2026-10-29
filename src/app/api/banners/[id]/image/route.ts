import { type NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { getStoredBanner, readBannerImage } from "@/lib/admin/banners";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const banner = await getStoredBanner(id);
  const notFound = () => NextResponse.json({ error: "Image not found." }, { status: 404, headers: { "Cache-Control": "no-store" } });
  if (!banner || !banner.storagePath || request.nextUrl.searchParams.get("v") !== banner.version) return notFound();
  if (banner.status !== "published" && !await getAdminSession()) return notFound();
  try {
    const data = await readBannerImage(banner);
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": "image/webp",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": banner.status === "published" ? "public, max-age=60" : "private, no-store",
      },
    });
  } catch {
    return notFound();
  }
}
