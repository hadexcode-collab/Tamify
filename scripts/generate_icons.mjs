import sharp from 'sharp';
import pngToIcoModule from 'png-to-ico';
import fs from 'fs';
import path from 'path';

const pngToIco = pngToIcoModule.default || pngToIcoModule;

async function generateIcons() {
  const root = process.cwd();
  const svgPath = path.join(root, 'public', 'icon.svg');
  const assetsDir = path.join(root, 'assets');

  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  const svgBuffer = fs.readFileSync(svgPath);

  console.log('Generating multi-resolution PNGs...');
  const sizes = [512, 256, 128, 64, 48, 32, 16];
  for (const s of sizes) {
    const filename = s === 512 ? 'icon.png' : `icon-${s}.png`;
    await sharp(svgBuffer).resize(s, s).png().toFile(path.join(assetsDir, filename));
  }

  console.log('Generating Windows multi-resolution icon.ico...');
  const icoBuffers = [
    path.join(assetsDir, 'icon-256.png'),
    path.join(assetsDir, 'icon-64.png'),
    path.join(assetsDir, 'icon-48.png'),
    path.join(assetsDir, 'icon-32.png'),
    path.join(assetsDir, 'icon-16.png')
  ];

  const icoBuf = await pngToIco(icoBuffers);
  fs.writeFileSync(path.join(assetsDir, 'icon.ico'), icoBuf);
  console.log('✅ Generated assets/icon.ico and assets/icon.png successfully!');
}

generateIcons().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
