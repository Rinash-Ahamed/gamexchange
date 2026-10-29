export type BannerSlide = {
  id: string;
  title: string;
  headline: string;
  description: string;
  alt: string;
  image: string;
};

export const bannerImageRequirements = {
  width: 1920,
  height: 840,
  minWidth: 1280,
  minHeight: 560,
  maxWidth: 4096,
  maxHeight: 1792,
  maxBytes: 5 * 1024 * 1024,
  maxPublished: 5,
  maxSaved: 20,
} as const;

export const defaultBannerSlides: BannerSlide[] = [
  { id: "neon-rush", title: "New releases", headline: "New worlds. Fresh drops.", description: "Explore the latest adventures landing at GameXChange.", alt: "Futuristic racing game artwork", image: "/promos/neon-rush.png" },
  { id: "disc-vault", title: "Game discs", headline: "The disc vault is open.", description: "Build your physical game library with new and pre-owned favourites.", alt: "Game cases and physical game discs", image: "/promos/disc-vault.png" },
  { id: "console-arrivals", title: "Consoles", headline: "Console arrivals.", description: "Power up with fresh hardware, controllers and complete bundles.", alt: "Gaming console, controller and headset", image: "/promos/console-arrivals.png" },
  { id: "retro-replay", title: "Retro gaming", headline: "Classics, replayed.", description: "Rediscover retro systems, cartridges and couch co-op favourites.", alt: "Retro gaming consoles and controllers", image: "/promos/retro-replay.png" },
  { id: "setup-upgrades", title: "Accessories", headline: "Upgrade every move.", description: "Controllers, headsets and accessories made for longer sessions.", alt: "Gaming controllers, headphones and accessories", image: "/promos/setup-upgrades.png" },
];
