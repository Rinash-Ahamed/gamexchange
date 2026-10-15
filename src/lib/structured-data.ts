import { branches, site } from "@/data/site";

const openDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Saturday", "Sunday"];

/** LocalBusiness data built only from facts published on the live site. */
export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": branches.map((b) => ({
      "@type": "Store",
      "@id": `${site.url}/#${b.id}`,
      name: `${site.name}: ${b.area.split(",")[0]}`,
      url: site.url,
      telephone: b.phone,
      description: "Buy, sell and exchange gaming consoles and accessories. Console and controller repairs. Gaming zone.",
      address: { "@type": "PostalAddress", addressLocality: b.area, addressRegion: site.region, addressCountry: site.country },
      geo: { "@type": "GeoCoordinates", latitude: b.lat, longitude: b.lng },
      openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: openDays, opens: site.hours.open, closes: site.hours.close }],
      sameAs: [site.social.instagram, site.social.facebook],
    })),
  };
}
