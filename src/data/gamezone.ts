export type ZoneStation = {
  id: string;
  name: string;
  /** Session rates, per head, as listed on the live site. */
  sessions?: { minutes: number; price: number }[];
  entry?: string;
  perk?: string;
};

export const zoneStations: readonly ZoneStation[] = [
  {
    id: "ps4",
    name: "PlayStation 4",
    sessions: [
      { minutes: 30, price: 80 },
      { minutes: 60, price: 150 },
    ],
    perk: "Complimentary beverage: Fanta, Sprite or Mountain Dew",
  },
  {
    id: "ps5",
    name: "PlayStation 5",
    sessions: [
      { minutes: 30, price: 100 },
      { minutes: 60, price: 170 },
    ],
    perk: "Complimentary beverage: Fanta, Sprite or Mountain Dew",
  },
  {
    id: "tekken",
    name: "Arcade Tekken Tournament",
    entry: "Minimum 5 coins: ₹20",
  },
];

export const zoneImages = [
  "eqAeksSrXuILlI1seJ9fzbPDKIo.jpg",
  "ovyoJ1prPkw58Ks8RJwnsp88.jpg",
  "zUMGtDw0yZdAD9KQGHExSzXQ0.jpg",
  "7d5uRCxohS3Qp6inLsSgi6Abb8.jpg",
].map((f, i) => ({
  src: `https://framerusercontent.com/images/${f}`,
  alt: `GamexChange gaming zone, photo ${i + 1}`,
}));
