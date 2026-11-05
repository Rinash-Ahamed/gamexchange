/** Browser preflight only. Sharp decoding on the server remains authoritative. */
export async function validateInventoryPhoto(file: File): Promise<void> {
  if (!file.size || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Choose a JPG, PNG or WebP image. HEIC, GIF, SVG and other formats are not supported.");
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const png = [137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => bytes[index] === byte);
  const webp = String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  if (!(file.type === "image/jpeg" && jpeg || file.type === "image/png" && png || file.type === "image/webp" && webp)) throw new Error("The file content does not match a supported image format. Export it as JPG, PNG or WebP and try again.");
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    if (Math.min(image.naturalWidth, image.naturalHeight) < 300 || Math.max(image.naturalWidth, image.naturalHeight) > 4096) throw new Error("Each image side must be between 300 and 4096 pixels.");
  } catch (error) {
    if (error instanceof Error && error.message.includes("300 and 4096")) throw error;
    throw new Error("This image could not be opened. Export a fresh JPG, PNG or WebP and try again.");
  } finally { URL.revokeObjectURL(url); }
}
