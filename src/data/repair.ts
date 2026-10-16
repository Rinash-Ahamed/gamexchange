export const repairCategories = ["Console", "Accessories"] as const;

/** Device lists taken verbatim from the live repair form. */
export const repairDevices: Record<(typeof repairCategories)[number], readonly string[]> = {
  Console: [
    "PlayStation 5 Standard",
    "PlayStation 5 Slim",
    "PlayStation 4 Pro",
    "PlayStation 4 Slim",
    "PlayStation 4 Standard",
    "PlayStation 3 Super Slim",
    "PlayStation 3 Slim",
    "PlayStation 3 Standard",
    "PlayStation 2 Slimline",
    "PlayStation 2 Standard",
    "Other",
  ],
  Accessories: [
    "PS5 Official DualSense Controller",
    "PS4 Official DualShock 4 Controller (V2)",
    "PS4 Official DualShock 4 Controller (V1)",
    "PS3 Official DualShock 3 Controller",
    "Official Xbox Series Controller",
    "Xbox One Official 2016 Wireless Controller",
    "PlayStation Move Motion Controller",
    "Other",
  ],
};

export const repairFaults = [
  "Power issues",
  "HDMI port",
  "Analogue drift issues",
  "Button issues",
  "Motherboard issues",
  "Heating issues",
  "Power supply",
  "General service",
  "Lens reading issues",
  "Others",
] as const;

export const exchangeConsoles = [
  "PlayStation 5",
  "PlayStation 4",
  "PlayStation 3",
  "PlayStation 2",
  "Xbox",
  "Other",
] as const;

export const exchangeConditions = [
  "Works perfectly",
  "Works with minor issues",
  "Not working",
] as const;

export const exchangeAccessories = [
  "Controller",
  "Power cable",
  "HDMI / AV cable",
  "Original box",
  "Games",
] as const;

export const exchangeUpgrades = [
  "PlayStation 5",
  "PlayStation 4",
  "PlayStation 3",
  "Controller or accessory",
  "Not sure yet",
] as const;

export const services = [
  { title: "Console Repair & Maintenance", icon: "wrench", href: "/repair-service" },
  { title: "Controller Diagnostics & Fixes", icon: "gamepad", href: "/repair-service" },
  { title: "Gaming PC Optimization & Upgrades", icon: "cpu", href: "/contact" },
  { title: "Accessory Replacement", icon: "plug", href: "/repair-service" },
  { title: "Trade-In & Exchange Programs", icon: "repeat", href: "/exchange" },
  { title: "Custom Gaming Setups", icon: "monitor", href: "/contact" },
  { title: "Performance Tuning for VR Devices", icon: "glasses", href: "/contact" },
  { title: "Gaming Consultation & Support", icon: "message", href: "/contact" },
  { title: "Franchise Opportunities", icon: "store", href: "/contact" },
] as const;
