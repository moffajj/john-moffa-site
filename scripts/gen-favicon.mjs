import sharp from "sharp";
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "../public");

// SVG with embedded font fallback (no Google Fonts import for rasterization — use system serif)
const makeSvg = (size) => {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - size * 0.02;
  const strokeW = size * 0.025;
  const fontSize = size * 0.38;
  const textY = cy + fontSize * 0.35;
  const letterSpacing = size * -0.03;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="#0a0a0a" stroke="#c9a84c" stroke-width="${strokeW}"/>
  <text
    x="${cx}"
    y="${textY}"
    text-anchor="middle"
    font-family="Georgia, 'Times New Roman', serif"
    font-weight="bold"
    font-size="${fontSize}"
    letter-spacing="${letterSpacing}"
    fill="#f0ede8"
  >JM</text>
</svg>`;
};

async function generate() {
  // 16x16
  await sharp(Buffer.from(makeSvg(16))).png().toFile(join(publicDir, "favicon-16x16.png"));
  console.log("✓ favicon-16x16.png");

  // 32x32
  await sharp(Buffer.from(makeSvg(32))).png().toFile(join(publicDir, "favicon-32x32.png"));
  console.log("✓ favicon-32x32.png");

  // 180x180 apple touch icon
  await sharp(Buffer.from(makeSvg(180))).png().toFile(join(publicDir, "apple-touch-icon.png"));
  console.log("✓ apple-touch-icon.png");

  // favicon.ico — use 32x32 PNG converted to ICO format
  // sharp doesn't support ICO natively; we'll write a minimal ICO wrapper around the 32x32 PNG
  const png32 = await sharp(Buffer.from(makeSvg(32))).png().toBuffer();

  // Build a minimal ICO file: 1 image, 32x32, 32bpp
  const icoHeader = Buffer.alloc(6);
  icoHeader.writeUInt16LE(0, 0);  // reserved
  icoHeader.writeUInt16LE(1, 2);  // type: 1 = ICO
  icoHeader.writeUInt16LE(1, 4);  // image count: 1

  const icoDir = Buffer.alloc(16);
  icoDir.writeUInt8(32, 0);       // width
  icoDir.writeUInt8(32, 1);       // height
  icoDir.writeUInt8(0, 2);        // color count (0 = more than 256)
  icoDir.writeUInt8(0, 3);        // reserved
  icoDir.writeUInt16LE(1, 4);     // color planes
  icoDir.writeUInt16LE(32, 6);    // bits per pixel
  icoDir.writeUInt32LE(png32.length, 8);  // size of image data
  icoDir.writeUInt32LE(6 + 16, 12);       // offset of image data

  const ico = Buffer.concat([icoHeader, icoDir, png32]);
  writeFileSync(join(publicDir, "favicon.ico"), ico);
  console.log("✓ favicon.ico");

  console.log("\nAll favicons generated successfully.");
}

generate().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
