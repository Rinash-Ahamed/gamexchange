export type Product = {
  id: string;
  name: string;
  platform: "PlayStation 2" | "PlayStation 3";
  category: "Console";
  condition: "Pre-Owned";
  /** Price in INR as listed on the live site. */
  price: number;
  /** Trade-in figures as listed on the live site. Indicative only — confirmed in store. */
  tradeInVoucher: number;
  tradeInCash: number;
  image: { src: string; width: number; height: number };
  featured?: boolean;
};

const img = (id: string, ext: "webp", width: number, height: number) => ({
  src: `https://framerusercontent.com/images/${id}.${ext}`,
  width,
  height,
});

export const products: readonly Product[] = [
  {
    id: "ps2-slimline",
    name: "PlayStation 2 Slimline",
    platform: "PlayStation 2",
    category: "Console",
    condition: "Pre-Owned",
    price: 5000,
    tradeInVoucher: 3300,
    tradeInCash: 2700,
    image: img("Ywlsf2sdA4v3FJf1GOjbTiQMV0U", "webp", 378, 480),
  },
  {
    id: "ps3-320-slim",
    name: "PlayStation 3 320GB Slim",
    platform: "PlayStation 3",
    category: "Console",
    condition: "Pre-Owned",
    price: 10500,
    tradeInVoucher: 5800,
    tradeInCash: 4200,
    image: img("nYaV5oSDyoVhi6lCXYXMyReOtRU", "webp", 480, 330),
  },
  {
    id: "ps3-12-super-slim",
    name: "PS3 12GB Super Slim",
    platform: "PlayStation 3",
    category: "Console",
    condition: "Pre-Owned",
    price: 10500,
    tradeInVoucher: 4200,
    tradeInCash: 3100,
    image: img("pr6XjOVNAXkfCFIBQISXtGqrI", "webp", 480, 368),
  },
  {
    id: "ps3-500-super-slim",
    name: "PS3 500GB Black Super Slim",
    platform: "PlayStation 3",
    category: "Console",
    condition: "Pre-Owned",
    price: 12000,
    tradeInVoucher: 4800,
    tradeInCash: 3600,
    image: img("EoROEpcvbxJPGobLfMYPp2svM", "webp", 480, 368),
    featured: true,
  },
];

export const formatINR = (n: number) => `₹${n.toLocaleString("en-IN")}`;
