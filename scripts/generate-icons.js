import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generate() {
  const iconSvg = fs.readFileSync('public/icon.svg');
  const maskableSvg = fs.readFileSync('public/icon-maskable.svg');

  console.log('Generating PWA icons...');
  
  // 192x192
  await sharp(iconSvg)
    .resize(192, 192)
    .png()
    .toFile('public/pwa-192x192.png');
  console.log('pwa-192x192.png generated');

  // 512x512
  await sharp(iconSvg)
    .resize(512, 512)
    .png()
    .toFile('public/pwa-512x512.png');
  console.log('pwa-512x512.png generated');

  // maskable 512x512
  await sharp(maskableSvg)
    .resize(512, 512)
    .png()
    .toFile('public/pwa-maskable-512x512.png');
  console.log('pwa-maskable-512x512.png generated');

  // apple-touch-icon 180x180 (iOS requires PNG, recommended 180x180)
  await sharp(iconSvg)
    .resize(180, 180)
    .png()
    .toFile('public/apple-touch-icon.png');
  console.log('apple-touch-icon.png generated');

  // favicon.ico / png 32x32
  await sharp(iconSvg)
    .resize(32, 32)
    .png()
    .toFile('public/favicon.ico');
  console.log('favicon.ico generated');

  console.log('All PWA icon assets generated successfully!');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
