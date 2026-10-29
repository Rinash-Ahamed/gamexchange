export const zoneStationNames = ["PlayStation 5", "PlayStation 4", "Logitech G29 Racing"] as const;

export type ZoneStation = {
  id: string;
  name: string;
  image: string;
  /** Total hourly package prices for the indicated number of players. */
  sessions: { players: number; label: string; price: number }[];
};

export const zoneStations: readonly ZoneStation[] = [
  {
    id: "ps5",
    name: zoneStationNames[0],
    image: "/images/game-zone/neon-console-lounge.png",
    sessions: [
      { players: 1, label: "Solo", price: 150 },
      { players: 2, label: "Duo", price: 200 },
      { players: 3, label: "Trio", price: 250 },
    ],
  },
  {
    id: "ps4",
    name: zoneStationNames[1],
    image: "/images/game-zone/multiplayer-station.png",
    sessions: [
      { players: 1, label: "Solo", price: 100 },
      { players: 2, label: "Duo", price: 150 },
      { players: 3, label: "Trio", price: 200 },
    ],
  },
  {
    id: "g29",
    name: zoneStationNames[2],
    image: "/images/game-zone/controller-station.png",
    sessions: [
      { players: 1, label: "Solo", price: 250 },
      { players: 2, label: "Duo", price: 300 },
      { players: 3, label: "Trio", price: 350 },
    ],
  },
];
