import type { MetadataRoute } from "next";
import { site } from "@/data/site";
import { policies } from "@/data/legal";

const routes = ["", "/products", "/exchange", "/repair-service", "/game-zone", "/contact", "/terms", "/policies", ...policies.map((policy) => `/policies/${policy.slug}`)];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((r) => ({ url: `${site.url}${r}`, changeFrequency: "weekly", priority: r === "" ? 1 : 0.7 }));
}
