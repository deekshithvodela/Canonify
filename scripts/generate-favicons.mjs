import os from 'os';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

let chromium;
try {
  const pw = await import('playwright');
  chromium = pw.chromium;
} catch {
  const home = os.homedir();
  const npxPath = path.join(home, '.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js');
  const pkg = await import(npxPath);
  chromium = pkg.chromium || pkg.default?.chromium;
}

const outDir = path.resolve('website/public');
fs.mkdirSync(outDir, { recursive: true });

// 1. Write standalone favicon.svg
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <rect width="48" height="48" rx="11" fill="#322e45"/>
  <circle cx="27" cy="6" r="2.2" fill="#d3c8e8"/>
  <circle cx="37.5" cy="6" r="2.2" fill="#d3c8e8"/>
  <path d="M 27 8.2 C 27 12, 32.2 13.5, 32.2 16.5" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M 37.5 8.2 C 37.5 12, 32.2 13.5, 32.2 16.5" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M 32.2 16.5 C 20.2 16.5, 9 22.5, 9 31.5 C 9 40.5, 20.2 43.5, 31.5 43.5" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="35.2" cy="42.8" r="3.8" fill="#d3c8e8"/>
  <circle cx="35.2" cy="42.8" r="1.6" fill="#322e45"/>
</svg>
`;

fs.writeFileSync(path.join(outDir, 'favicon.svg'), faviconSvg.trim());
console.log('Saved website/public/favicon.svg');

// 2. High-resolution HTML template for rendering raster icons
const iconHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 512px;
      height: 512px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
    }
    .badge {
      width: 512px;
      height: 512px;
      background: linear-gradient(135deg, #272336 0%, #322e45 60%, #4c3f6b 100%);
      border-radius: 118px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: inset 0 0 0 8px rgba(169, 154, 199, 0.35);
    }
    svg {
      width: 370px;
      height: 370px;
    }
  </style>
</head>
<body>
  <div class="badge">
    <svg viewBox="0 0 32 32" fill="none" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="18" cy="4" r="1.6" fill="#d3c8e8" stroke="none"/>
      <circle cx="25" cy="4" r="1.6" fill="#d3c8e8" stroke="none"/>
      <path d="M 18 5.5 C 18 8, 21.5 9, 21.5 11"/>
      <path d="M 25 5.5 C 25 8, 21.5 9, 21.5 11"/>
      <path d="M 21.5 11 C 13.5 11, 6 15, 6 21 C 6 27, 13.5 29, 21 29"/>
      <circle cx="23.5" cy="28.5" r="2.5" fill="#d3c8e8" stroke="none"/>
      <circle cx="23.5" cy="28.5" r="1.1" fill="#322e45" stroke="none"/>
    </svg>
  </div>
</body>
</html>
`;

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 512, height: 512 },
    deviceScaleFactor: 1
  });

  await page.setContent(iconHtml, { waitUntil: 'load' });
  const master512 = path.join(outDir, 'icon-512.png');
  await page.screenshot({ path: master512, omitBackground: true, type: 'png' });
  await browser.close();

  // Resize to Google 48x48 standard
  const fav48 = path.join(outDir, 'favicon-48x48.png');
  execSync(`/usr/bin/convert "${master512}" -resize 48x48 -colors 256 png8:"${fav48}"`);
  console.log('Generated website/public/favicon-48x48.png (48x48)');

  // Resize to Apple Touch Icon 180x180
  const appleTouch = path.join(outDir, 'apple-touch-icon.png');
  execSync(`/usr/bin/convert "${master512}" -resize 180x180 -colors 256 png8:"${appleTouch}"`);
  console.log('Generated website/public/apple-touch-icon.png (180x180)');

  // Generate multi-resolution favicon.ico (48, 32, 16)
  const favIco = path.join(outDir, 'favicon.ico');
  execSync(`/usr/bin/convert "${master512}" -define icon:auto-resize=48,32,16 "${favIco}"`);
  console.log('Generated website/public/favicon.ico (48, 32, 16)');

  // Generate PWA Icon 192x192
  const pwa192 = path.join(outDir, 'icon-192x192.png');
  execSync(`/usr/bin/convert "${master512}" -resize 192x192 "${pwa192}"`);
  console.log('Generated website/public/icon-192x192.png (192x192)');

  // Generate PWA Icon 512x512
  const pwa512 = path.join(outDir, 'icon-512x512.png');
  fs.copyFileSync(master512, pwa512);
  console.log('Generated website/public/icon-512x512.png (512x512)');

  // Clean up master scratch
  if (fs.existsSync(master512)) fs.unlinkSync(master512);

  // Remove obsolete vite.svg
  const viteSvg = path.join(outDir, 'vite.svg');
  if (fs.existsSync(viteSvg)) {
    fs.unlinkSync(viteSvg);
    console.log('Removed obsolete website/public/vite.svg');
  }

  console.log('All favicon suite assets successfully created!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
