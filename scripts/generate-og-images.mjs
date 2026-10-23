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

const SVG_LOGO = `
<svg width="64" height="64" viewBox="0 0 32 32" fill="none" stroke="#d3c8e8" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="18" cy="4" r="1.6" fill="#d3c8e8" stroke="none"/>
  <circle cx="25" cy="4" r="1.6" fill="#d3c8e8" stroke="none"/>
  <path d="M 18 5.5 C 18 8, 21.5 9, 21.5 11"/>
  <path d="M 25 5.5 C 25 8, 21.5 9, 21.5 11"/>
  <path d="M 21.5 11 C 13.5 11, 6 15, 6 21 C 6 27, 13.5 29, 21 29"/>
  <circle cx="23.5" cy="28.5" r="2.5" fill="#d3c8e8"/>
  <circle cx="23.5" cy="28.5" r="1.1" fill="#201c2c" stroke="none"/>
</svg>
`;

const templates = [
  {
    name: 'og-image',
    width: 1200,
    height: 630,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            width: 1200px;
            height: 630px;
            background: linear-gradient(135deg, #161320 0%, #201c2c 50%, #2a223a 100%);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
            color: #ffffff;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 60px 75px;
            position: relative;
            overflow: hidden;
          }
          /* Background decorative glow */
          .glow-1 {
            position: absolute;
            top: -100px;
            right: -80px;
            width: 500px;
            height: 500px;
            background: radial-gradient(circle, rgba(142, 123, 181, 0.28) 0%, rgba(76, 63, 107, 0) 70%);
            border-radius: 50%;
          }
          .glow-2 {
            position: absolute;
            bottom: -120px;
            left: 20%;
            width: 450px;
            height: 450px;
            background: radial-gradient(circle, rgba(76, 63, 107, 0.3) 0%, transparent 70%);
            border-radius: 50%;
          }
          /* Top bar */
          .top-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: relative;
            z-index: 2;
          }
          .brand {
            display: flex;
            align-items: center;
            gap: 18px;
          }
          .brand-text {
            font-family: Georgia, serif;
            font-size: 34px;
            font-weight: 700;
            letter-spacing: -0.5px;
            color: #ffffff;
          }
          .badge-year {
            background: rgba(142, 123, 181, 0.25);
            border: 1px solid rgba(169, 154, 199, 0.45);
            color: #d3c8e8;
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 1.5px;
            padding: 5px 12px;
            border-radius: 20px;
            text-transform: uppercase;
          }
          .tag-domain {
            font-size: 16px;
            color: #a99ac7;
            font-weight: 500;
            letter-spacing: 0.5px;
          }
          /* Main content */
          .content {
            position: relative;
            z-index: 2;
            margin-top: 10px;
          }
          .kicker {
            color: #a99ac7;
            font-size: 14px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .kicker-dot {
            width: 8px;
            height: 8px;
            background: #a99ac7;
            border-radius: 50%;
          }
          .headline {
            font-family: Georgia, serif;
            font-size: 54px;
            font-weight: 700;
            line-height: 1.15;
            color: #ffffff;
            margin-bottom: 18px;
            max-width: 950px;
            letter-spacing: -0.8px;
          }
          .description {
            font-size: 20px;
            line-height: 1.5;
            color: #c9c1d8;
            max-width: 900px;
            font-weight: 400;
          }
          /* Stats footer */
          .stats-bar {
            display: flex;
            align-items: center;
            gap: 20px;
            position: relative;
            z-index: 2;
            padding-top: 24px;
            border-top: 1px solid rgba(226, 221, 232, 0.15);
          }
          .stat-pill {
            display: flex;
            align-items: center;
            gap: 10px;
            background: rgba(32, 28, 44, 0.85);
            border: 1px solid rgba(169, 154, 199, 0.3);
            padding: 8px 18px;
            border-radius: 30px;
            font-size: 14px;
            color: #e2dde8;
            font-weight: 500;
          }
          .stat-pill strong {
            color: #ffffff;
            font-weight: 700;
          }
        </style>
      </head>
      <body>
        <div class="glow-1"></div>
        <div class="glow-2"></div>
        <div class="top-bar">
          <div class="brand">
            ${SVG_LOGO}
            <div class="brand-text">Canonify</div>
            <div class="badge-year">2026 Archive</div>
          </div>
          <div class="tag-domain">MCC &bull; State Authorities</div>
        </div>
        <div class="content">
          <div class="kicker">
            <span class="kicker-dot"></span>
            Public Records &bull; Official Admissions Directory
          </div>
          <h1 class="headline">NEET UG Counselling Documents Archive</h1>
          <p class="description">
            Complete discovery directory of official seat allotment results, state merit rank lists, vacancy seat matrices, and notifications directly from MCC and 36 State/UT admissions authorities.
          </p>
        </div>
        <div class="stats-bar">
          <div class="stat-pill">🏛️ <strong>36</strong> States &amp; UTs + MCC</div>
          <div class="stat-pill">📄 <strong>206</strong> Official Documents</div>
          <div class="stat-pill">⚡ <strong>Instant</strong> PDF Preview &amp; Download</div>
          <div class="stat-pill">🛡️ <strong>Zero</strong> User Tracking</div>
        </div>
      </body>
      </html>
    `
  },
  {
    name: 'og-square',
    width: 600,
    height: 600,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            width: 600px;
            height: 600px;
            background: linear-gradient(135deg, #161320 0%, #201c2c 60%, #2a223a 100%);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
            color: #ffffff;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 45px;
            position: relative;
            overflow: hidden;
          }
          .glow {
            position: absolute;
            top: -60px;
            right: -60px;
            width: 320px;
            height: 320px;
            background: radial-gradient(circle, rgba(142, 123, 181, 0.35) 0%, transparent 70%);
            border-radius: 50%;
          }
          .top-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: relative;
            z-index: 2;
          }
          .brand-wrap {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .title-brand {
            font-family: Georgia, serif;
            font-size: 28px;
            font-weight: 700;
          }
          .badge {
            background: rgba(142, 123, 181, 0.25);
            border: 1px solid rgba(169, 154, 199, 0.4);
            color: #d3c8e8;
            font-size: 11px;
            font-weight: 700;
            padding: 3px 9px;
            border-radius: 12px;
          }
          .center {
            position: relative;
            z-index: 2;
            margin: auto 0;
          }
          .kicker {
            color: #a99ac7;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            margin-bottom: 10px;
          }
          .h1 {
            font-family: Georgia, serif;
            font-size: 38px;
            font-weight: 700;
            line-height: 1.2;
            margin-bottom: 14px;
          }
          .desc {
            font-size: 15px;
            line-height: 1.5;
            color: #c9c1d8;
          }
          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            position: relative;
            z-index: 2;
            padding-top: 18px;
            border-top: 1px solid rgba(226, 221, 232, 0.15);
          }
          .pill {
            background: rgba(32, 28, 44, 0.85);
            border: 1px solid rgba(169, 154, 199, 0.3);
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            color: #e2dde8;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="glow"></div>
        <div class="top-row">
          <div class="brand-wrap">
            ${SVG_LOGO}
            <div class="title-brand">Canonify</div>
          </div>
          <div class="badge">2026 Archive</div>
        </div>
        <div class="center">
          <div class="kicker">NEET Counselling Directory</div>
          <div class="h1">Official Medical Admissions Documents</div>
          <div class="desc">Allotment results, state merit lists, and seat matrices for 36 States &amp; UTs.</div>
        </div>
        <div class="grid">
          <div class="pill">🏛️ 36 States &amp; UTs</div>
          <div class="pill">📄 206 Documents</div>
          <div class="pill">⚡ Fast PDF Preview</div>
          <div class="pill">🛡️ Zero User Tracking</div>
        </div>
      </body>
      </html>
    `
  },
  {
    name: 'og-banner-wide',
    width: 1200,
    height: 400,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            width: 1200px;
            height: 400px;
            background: linear-gradient(135deg, #161320 0%, #201c2c 50%, #2a223a 100%);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 40px 70px;
            position: relative;
            overflow: hidden;
          }
          .glow {
            position: absolute;
            top: -100px;
            right: 0;
            width: 450px;
            height: 450px;
            background: radial-gradient(circle, rgba(142, 123, 181, 0.3) 0%, transparent 70%);
            border-radius: 50%;
          }
          .left-col {
            position: relative;
            z-index: 2;
            max-width: 720px;
          }
          .brand-row {
            display: flex;
            align-items: center;
            gap: 14px;
            margin-bottom: 16px;
          }
          .brand-name {
            font-family: Georgia, serif;
            font-size: 32px;
            font-weight: 700;
          }
          .badge {
            background: rgba(142, 123, 181, 0.25);
            border: 1px solid rgba(169, 154, 199, 0.4);
            color: #d3c8e8;
            font-size: 12px;
            font-weight: 700;
            padding: 4px 10px;
            border-radius: 16px;
          }
          .title {
            font-family: Georgia, serif;
            font-size: 38px;
            font-weight: 700;
            line-height: 1.2;
            margin-bottom: 12px;
          }
          .sub {
            font-size: 17px;
            color: #c9c1d8;
            line-height: 1.4;
          }
          .right-col {
            position: relative;
            z-index: 2;
            display: flex;
            flex-direction: column;
            gap: 12px;
            min-width: 280px;
          }
          .card {
            background: rgba(32, 28, 44, 0.85);
            border: 1px solid rgba(169, 154, 199, 0.3);
            padding: 12px 18px;
            border-radius: 12px;
            font-size: 14px;
            color: #e2dde8;
          }
          .card strong {
            color: #ffffff;
            font-size: 16px;
          }
        </style>
      </head>
      <body>
        <div class="glow"></div>
        <div class="left-col">
          <div class="brand-row">
            ${SVG_LOGO}
            <div class="brand-name">Canonify</div>
            <div class="badge">2026 Archive</div>
          </div>
          <div class="title">NEET UG Counselling Files Directory</div>
          <div class="sub">Official seat allotments, state rank merit lists, and seat matrices directly sourced from statutory admissions authorities.</div>
        </div>
        <div class="right-col">
          <div class="card">🏛️ <strong>36 States &amp; UTs</strong> + MCC</div>
          <div class="card">📄 <strong>206 Verified Documents</strong></div>
          <div class="card">⚡ <strong>Fast Preview &amp; Download</strong></div>
        </div>
      </body>
      </html>
    `
  },
  {
    name: 'og-mobile',
    width: 1080,
    height: 1920,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            width: 1080px;
            height: 1920px;
            background: linear-gradient(165deg, #161320 0%, #201c2c 45%, #2a223a 100%);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
            color: #ffffff;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 120px 90px;
            position: relative;
            overflow: hidden;
          }
          .glow-top {
            position: absolute;
            top: -150px;
            right: -150px;
            width: 800px;
            height: 800px;
            background: radial-gradient(circle, rgba(142, 123, 181, 0.3) 0%, transparent 70%);
            border-radius: 50%;
          }
          .glow-bottom {
            position: absolute;
            bottom: -200px;
            left: -100px;
            width: 900px;
            height: 900px;
            background: radial-gradient(circle, rgba(76, 63, 107, 0.35) 0%, transparent 70%);
            border-radius: 50%;
          }
          .top {
            position: relative;
            z-index: 2;
          }
          .brand-box {
            display: flex;
            align-items: center;
            gap: 24px;
            margin-bottom: 30px;
          }
          .brand-text {
            font-family: Georgia, serif;
            font-size: 56px;
            font-weight: 700;
          }
          .badge {
            background: rgba(142, 123, 181, 0.25);
            border: 1px solid rgba(169, 154, 199, 0.4);
            color: #d3c8e8;
            font-size: 22px;
            font-weight: 700;
            padding: 8px 22px;
            border-radius: 30px;
            letter-spacing: 1px;
          }
          .center {
            position: relative;
            z-index: 2;
            margin: auto 0;
          }
          .kicker {
            color: #a99ac7;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: 3px;
            text-transform: uppercase;
            margin-bottom: 24px;
          }
          .main-title {
            font-family: Georgia, serif;
            font-size: 86px;
            font-weight: 700;
            line-height: 1.15;
            margin-bottom: 36px;
            letter-spacing: -1px;
          }
          .lead-para {
            font-size: 34px;
            line-height: 1.5;
            color: #c9c1d8;
            margin-bottom: 60px;
          }
          .feature-grid {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }
          .feature-card {
            background: rgba(32, 28, 44, 0.85);
            border: 1px solid rgba(169, 154, 199, 0.3);
            padding: 24px 36px;
            border-radius: 20px;
            font-size: 28px;
            color: #e2dde8;
            display: flex;
            align-items: center;
            gap: 20px;
          }
          .feature-card strong {
            color: #ffffff;
            font-size: 32px;
          }
          .bottom-bar {
            position: relative;
            z-index: 2;
            padding-top: 40px;
            border-top: 1px solid rgba(226, 221, 232, 0.2);
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 28px;
            color: #a99ac7;
          }
        </style>
      </head>
      <body>
        <div class="glow-top"></div>
        <div class="glow-bottom"></div>
        <div class="top">
          <div class="brand-box">
            ${SVG_LOGO}
            <div class="brand-text">Canonify</div>
            <div class="badge">2026 Archive</div>
          </div>
        </div>
        <div class="center">
          <div class="kicker">NEET Counselling Directory</div>
          <h1 class="main-title">Official Medical Admissions Documents</h1>
          <p class="lead-para">
            Access, search, preview, and download official NEET UG seat allotment lists, state rank merit lists, and vacancy matrices across MCC and 36 State/UT admissions committees.
          </p>
          <div class="feature-grid">
            <div class="feature-card">🏛️ <strong>36</strong> States &amp; Union Territories</div>
            <div class="feature-card">📄 <strong>206</strong> Official Verified Documents</div>
            <div class="feature-card">⚡ <strong>Instant</strong> PDF Preview &amp; Download</div>
            <div class="feature-card">🛡️ <strong>Zero</strong> User Tracking or Ads</div>
          </div>
        </div>
        <div class="bottom-bar">
          <div>NEET UG 2026</div>
          <div>Public Records Archive</div>
        </div>
      </body>
      </html>
    `
  }
];

async function generate() {
  console.log('Launching headless browser to generate crisp Open Graph link preview images...');
  const browser = await chromium.launch({ headless: true });

  const outDir = path.resolve('website/public');
  fs.mkdirSync(outDir, { recursive: true });

  for (const t of templates) {
    const page = await browser.newPage({
      viewport: { width: t.width, height: t.height },
      deviceScaleFactor: 1
    });

    await page.setContent(t.html, { waitUntil: 'load' });
    const rawPng = path.join(outDir, `${t.name}-raw.png`);
    const finalPng = path.join(outDir, `${t.name}.png`);
    const finalJpg = path.join(outDir, `${t.name}.jpg`);

    // Capture uncompressed PNG
    await page.screenshot({ path: rawPng, type: 'png' });
    await page.close();

    // Optimize PNG to 256 colors for small file size (<100KB for WhatsApp)
    try {
      execSync(`/usr/bin/convert "${rawPng}" -colors 256 png8:"${finalPng}"`);
      execSync(`/usr/bin/convert "${rawPng}" -quality 85 "${finalJpg}"`);
      if (fs.existsSync(rawPng)) fs.unlinkSync(rawPng);
      const pngSize = (fs.statSync(finalPng).size / 1024).toFixed(1);
      const jpgSize = (fs.statSync(finalJpg).size / 1024).toFixed(1);
      console.log(`Generated: ${t.name}.png (${pngSize} KB) & ${t.name}.jpg (${jpgSize} KB)`);
    } catch (e) {
      console.warn(`Fallback: ImageMagick convert failed for ${t.name}, using raw screenshot`, e.message);
      fs.renameSync(rawPng, finalPng);
    }
  }

  await browser.close();
  console.log('All Open Graph images successfully created and optimized!');
}

generate().catch(err => {
  console.error('Error generating OG images:', err);
  process.exit(1);
});

