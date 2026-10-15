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
  {
    src: "/images/game-zone/neon-console-lounge.png",
    alt: "Futuristic blue and violet console gaming lounge",
  },
  {
    src: "/images/game-zone/multiplayer-station.png",
    alt: "Four-seat competitive multiplayer gaming station",
  },
  {
    src: "/images/game-zone/arcade-tournament.png",
    alt: "Neon head-to-head arcade tournament setup",
  },
  {
    src: "/images/game-zone/controller-station.png",
    alt: "Two controllers on an illuminated gaming desk",
  },
] as const;
