import { readFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const root = join(import.meta.dirname, "..");
const outDir = join(root, "public", "icons", "pwa");

const BACKGROUND = "#232832"; // --cf-charcoal-900
const LOGO_COLOR = "#fff2d1"; // --cf-cream

const rawLogo = readFileSync(
  join(root, "public", "brand", "logo-c.svg"),
  "utf8"
);
const coloredLogo = rawLogo.replace(
  /fill="currentColor"/g,
  `fill="${LOGO_COLOR}"`
);

async function renderIcon({ size, fileName, logoScale }) {
  const logoWidth = Math.round(size * logoScale);
  const logoHeight = Math.round(logoWidth * (40 / 36)); // logo-c.svg viewBox is 36x40

  const logoBuffer = await sharp(Buffer.from(coloredLogo))
    .resize(logoWidth, logoHeight)
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BACKGROUND,
    },
  })
    .composite([
      {
        input: logoBuffer,
        left: Math.round((size - logoWidth) / 2),
        top: Math.round((size - logoHeight) / 2),
      },
    ])
    .png()
    .toFile(join(outDir, fileName));

  console.log(`wrote ${fileName}`);
}

await renderIcon({ size: 192, fileName: "icon-192.png", logoScale: 0.55 });
await renderIcon({ size: 512, fileName: "icon-512.png", logoScale: 0.55 });
await renderIcon({
  size: 512,
  fileName: "icon-512-maskable.png",
  logoScale: 0.4,
});
await renderIcon({
  size: 180,
  fileName: "apple-touch-icon.png",
  logoScale: 0.6,
});
