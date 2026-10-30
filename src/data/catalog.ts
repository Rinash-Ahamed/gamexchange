export const shopSections = [
  { id: "games", label: "Games" },
  { id: "consoles", label: "Consoles" },
  { id: "accessories", label: "Accessories" },
] as const;
export type ShopSection = (typeof shopSections)[number]["id"];
export const productConditions = ["New", "Pre-Owned", "Refurbished"] as const;
export const gameFormats = ["Disc", "Cartridge"] as const;
export const platformSuggestions = ["PlayStation 5", "PlayStation 4", "PlayStation 3", "PlayStation 2", "Xbox Series X", "Xbox Series S", "Xbox One", "Nintendo Switch", "Nintendo Switch 2", "Multi-Platform"] as const;
export const genreSuggestions = ["Action", "Adventure", "Sports", "Racing", "Fighting", "Role-playing", "Shooter", "Simulation", "Family", "Strategy"] as const;
export const brandSuggestions = ["Sony", "Microsoft", "Nintendo", "Logitech", "Razer", "PowerA", "Ubisoft", "EA", "Rockstar Games", "Bandai Namco", "Capcom", "Square Enix"] as const;
export const playModeChoices = ["Single-player", "Local multiplayer", "Online multiplayer"] as const;
export const ageRatingSuggestions = ["PEGI 3", "PEGI 7", "PEGI 12", "PEGI 16", "PEGI 18", "ESRB E", "ESRB E10+", "ESRB T", "ESRB M 17+"] as const;

export function normalizeCondition(value: string) {
  const key = value.trim().toLowerCase().replace(/[\s-]/g, "");
  return key === "preowned" ? "Pre-Owned" : key === "new" ? "New" : key === "refurbished" ? "Refurbished" : value.trim();
}

export function isPcComponentCategory(category: string) {
  return /\b(pc components?|computer components?|gaming pc|desktop pc|processors?|graphics cards?|motherboards?|cpu|gpu|ram)\b/i.test(category);
}

/** Legacy stock keeps working without a database migration. */
export function productSection(product: { shopSection?: ShopSection; category: string }): ShopSection {
  if (product.shopSection) return product.shopSection;
  if (/\b(console|consoles|handheld)\b/i.test(product.category)) return "consoles";
  if (/\b(game|games|disc|discs|cartridge)\b/i.test(product.category)) return "games";
  return "accessories";
}

export function normalizePlatform(value: string) {
  const cleaned = value.trim().replace(/\s+/g, " ");
  const key = cleaned.toLowerCase().replace(/[\s-]/g, "");
  const alias = /^ps([2345])$/.exec(key);
  if (alias) return `PlayStation ${alias[1]}`;
  return platformSuggestions.find((name) => name.toLowerCase().replace(/[\s-]/g, "") === key) ?? cleaned;
}
