import localFont from "next/font/local";

export const chakra = localFont({
  src: [
    { path: "../../node_modules/@fontsource/chakra-petch/files/chakra-petch-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../node_modules/@fontsource/chakra-petch/files/chakra-petch-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../../node_modules/@fontsource/chakra-petch/files/chakra-petch-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-chakra",
  display: "swap",
});

export const inter = localFont({
  src: "../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
});
