import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "GamexChange: Your game. Your rules.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logo = `data:image/png;base64,${(await readFile(join(process.cwd(), "public/brand/gamexchange-logo-900.png"))).toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "radial-gradient(circle at 80% 20%, #2b3f8f 0%, #07090f 60%)", color: "#f5f7ff" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders its own image document. */}
        <img src={logo} alt="" width={330} height={135} />
        <div style={{ fontSize: 132, fontWeight: 800, lineHeight: 0.95, marginTop: 24, textTransform: "uppercase" }}>Your game.</div>
        <div style={{ fontSize: 132, fontWeight: 800, lineHeight: 0.95, textTransform: "uppercase", color: "#865cff" }}>Your rules.</div>
        <div style={{ fontSize: 34, marginTop: 36, color: "#939bac" }}>Buy. Sell. Exchange. Repair. Play.</div>
      </div>
    ),
    size,
  );
}
