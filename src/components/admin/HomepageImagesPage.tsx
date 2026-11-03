import { homepageImageSlots } from "@/data/homepage-images";
import { homepageAssetUrl, readHomepageImageAssets } from "@/lib/admin/homepage-images";
import { requireAdmin } from "@/lib/admin/auth";
import { HomepageImageEditor } from "./HomepageImageEditor";
export async function HomepageImagesPage({ group }: { group: "services" | "gamezone" }) {
  await requireAdmin();
  const images = await readHomepageImageAssets();
  return <div className="mx-auto max-w-6xl"><h1 className="font-display text-2xl font-bold uppercase">{group === "services" ? "Service images" : "Game Zone images"}</h1>
    <p className="mt-2 text-sm leading-6 text-muted">{group === "gamezone" ? "Manage Game Zone images shown on the homepage and Game Zone page." : "Manage the homepage service images."}</p>
    <p className="mt-4 text-xs leading-5 text-muted">Recommended: 1200 x 900 px. JPG, PNG or WebP, up to 5 MB. Keep important details centred.</p>
    <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{homepageImageSlots.filter((slot) => slot.group === group).map((slot) => <HomepageImageEditor key={`${slot.id}-${images[slot.id]?.version ?? "default"}`} id={slot.id} title={slot.title} image={homepageAssetUrl(slot.id, images[slot.id])} custom={Boolean(images[slot.id])} />)}</div>
  </div>;
}
