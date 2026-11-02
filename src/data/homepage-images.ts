import { zoneStations } from "./gamezone";

export const serviceImages = [
  { id: "service-shop", title: "Consoles & game discs", image: "/promos/console-arrivals.png" },
  { id: "service-accessories", title: "Controllers & accessories", image: "/promos/setup-upgrades.png" },
  { id: "service-trade", title: "Sell or trade in", image: "/hero/gamexchange-hardware-stage.webp" },
  { id: "service-repairs", title: "Console & controller repairs", image: "/images/game-zone/controller-station.png" },
  { id: "service-play", title: "Play at the game zone", image: "/images/game-zone/multiplayer-station.png" },
  { id: "service-franchise", title: "Franchise enquiry", image: "/franchise/kovai-pudur.webp" },
] as const;
export const homepageImageSlots = [
  ...serviceImages.map((item) => ({ ...item, group: "services" as const })),
  ...zoneStations.map((item) => ({ id: `zone-${item.id}`, title: item.name, image: item.image, group: "gamezone" as const })),
];
export type HomepageImages = Record<string, string>;
