import { homepageImageSlots } from "@/data/homepage-images";
import { homepageAssetUrl, readHomepageImageAssets } from "@/lib/admin/homepage-images";
import { requireAdmin } from "@/lib/admin/auth";
import { HomepageImageEditor } from "./HomepageImageEditor";
export async function HomepageImagesPage({ group }: { group: "services" | "gamezone" }) {
  await requireAdmin();
  const images = await readHomepageImageAssets();
  return <div className="mx-auto max-w-6xl"><h1 className="font-display text-2xl font-bold uppercase">{group === "services" ? "Service images" : "Game Zone images"}</h1>
    <p className="mt-2 text-sm leading-6 text-muted">{group === "gamezone" ? "Replace station backgrounds on both the homepage and Game Zone page from here." : "Replace the homepage service-card backgrounds."} Titles, links and prices stay unchanged. Images publish after confirmation.</p>
    <p className="mt-4 rounded-xl border border-line bg-surface p-3 text-sm text-muted">Recommended: 1200 x 900 px (4:3). Static JPG, PNG or WebP, up to 5 MB; each side 300 to 4096 px. Keep important details centred with room for text. The card background crops to fit.</p>
    <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{homepageImageSlots.filter((slot) => slot.group === group).map((slot) => <HomepageImageEditor key={`${slot.id}-${images[slot.id]?.version ?? "default"}`} id={slot.id} title={slot.title} image={homepageAssetUrl(slot.id, images[slot.id])} custom={Boolean(images[slot.id])} />)}</div>
  </div>;
}
