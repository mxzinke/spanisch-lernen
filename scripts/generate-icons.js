import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputDir = join(__dirname, '..', 'public', 'icons');

// SVG icon with Spanish theme (terracotta color, "E" for Español)
const svgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#c77b58"/>
      <stop offset="100%" style="stop-color:#a65d57"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="96" fill="url(#bg)"/>
  <text x="256" y="340"
        font-family="Georgia, serif"
        font-size="280"
        font-weight="600"
        fill="#faf6f0"
        text-anchor="middle">E</text>
  <text x="256" y="420"
        font-family="Georgia, serif"
        font-size="60"
        fill="#faf6f0"
        opacity="0.8"
        text-anchor="middle">español</text>
</svg>
`;

const sizes = [192, 512];

async function generateIcons() {
  await mkdir(outputDir, { recursive: true });

  for (const size of sizes) {
    const outputPath = join(outputDir, `icon-${size}.png`);
    await sharp(Buffer.from(svgIcon))
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`Generated: ${outputPath}`);
  }

  // Generate Apple Touch Icon (180x180)
  const appleTouchPath = join(outputDir, 'apple-touch-icon.png');
  await sharp(Buffer.from(svgIcon))
    .resize(180, 180)
    .png()
    .toFile(appleTouchPath);
  console.log(`Generated: ${appleTouchPath}`);

  // Generate favicon (32x32)
  const faviconPath = join(outputDir, 'favicon-32.png');
  await sharp(Buffer.from(svgIcon))
    .resize(32, 32)
    .png()
    .toFile(faviconPath);
  console.log(`Generated: ${faviconPath}`);

  console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);
