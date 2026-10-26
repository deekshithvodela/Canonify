import fs from 'fs';
import path from 'path';
import os from 'os';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

function getPlaywright() {
  try {
    return require('playwright');
  } catch (e) {
    const npxDir = path.join(os.homedir(), '.npm/_npx');
    if (fs.existsSync(npxDir)) {
      for (const d of fs.readdirSync(npxDir)) {
        const pw = path.join(npxDir, d, 'node_modules', 'playwright');
        if (fs.existsSync(pw)) {
          return require(pw);
        }
      }
    }
    throw new Error('Playwright not found');
  }
}

const { chromium } = getPlaywright();


const ARTIFACTS_DIR = '/home/drover/.gemini/antigravity-ide/brain/67341647-1576-4a58-923b-10c7d52e643c';
const PORT = 4157;
const BASE_URL = `http://localhost:${PORT}`;

async function runVerification() {
  console.log(`Starting Phase 34 Playwright Verification at ${BASE_URL}...`);
  const browser = await chromium.launch({ headless: true });

  try {
    // ----------------------------------------------------
    // TEST 1: Mobile Viewport (375x667) - Viewport Lock, Title Truncation, Continuous Scroll & Zoom
    // ----------------------------------------------------
    console.log('\n--- Test 1: Mobile Viewport (375x667) ---');
    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 667 },
      isMobile: true,
      hasTouch: true,
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(BASE_URL, { waitUntil: 'networkidle' });

    // Step 1: Check initial viewport meta before opening modal
    const initialMeta = await mobilePage.evaluate(() => {
      const meta = document.querySelector('meta[name="viewport"]');
      return meta ? meta.getAttribute('content') : null;
    });
    console.log('1. Initial viewport meta content:', initialMeta);
    if (!initialMeta?.includes('width=device-width')) {
      throw new Error(`Expected initial viewport meta to contain width=device-width, got: ${initialMeta}`);
    }

    // Step 2: Open a PDF preview modal by clicking the first Preview button
    const previewBtn = mobilePage.locator('button:has-text("Preview"), button[title*="Preview"]').first();
    await previewBtn.waitFor({ state: 'visible', timeout: 5000 });
    await previewBtn.click();

    // Wait for modal dialog
    const modalDialog = mobilePage.locator('div[role="dialog"]');
    await modalDialog.waitFor({ state: 'visible', timeout: 5000 });
    console.log('2. PDF preview modal opened.');

    // Step 3: Verify viewport meta is now zoom-locked
    const lockedMeta = await mobilePage.evaluate(() => {
      const meta = document.querySelector('meta[name="viewport"]');
      return meta ? meta.getAttribute('content') : null;
    });
    console.log('3. Locked viewport meta content:', lockedMeta);
    if (!lockedMeta?.includes('user-scalable=no') || !lockedMeta?.includes('maximum-scale=1.0')) {
      throw new Error(`Expected locked meta to contain user-scalable=no and maximum-scale=1.0, got: ${lockedMeta}`);
    }
    console.log('✓ Dynamic mobile viewport zoom lock verified!');

    // Step 4: Verify title truncation and actions header layout (no collision)
    const titleBounding = await mobilePage.locator('#pdf-modal-title').boundingBox();
    const closeBtn = mobilePage.locator('button[aria-label="Close Preview"]');
    const closeBounding = await closeBtn.boundingBox();

    console.log(`4. Title right edge: ${titleBounding.x + titleBounding.width}px, Close button left: ${closeBounding.x}px`);
    if (titleBounding.x + titleBounding.width > closeBounding.x) {
      throw new Error(`Document title overlaps with action controls!`);
    }
    console.log('✓ Document title truncated safely without colliding with controls!');

    // Step 5: Wait for PDF.js to load document and render page 1
    const page1 = mobilePage.locator('#pdf-page-1');
    await page1.waitFor({ state: 'visible', timeout: 15000 });
    const page1Canvas = page1.locator('canvas');
    await page1Canvas.waitFor({ state: 'visible', timeout: 15000 });
    console.log('5. PDF Page 1 rendered to canvas.');

    // Step 6: Verify continuous scroll & multi-page navigation
    const pageCounter = await mobilePage.locator('span.font-mono:has-text("Page")').first().innerText();
    console.log('6. Initial page counter:', pageCounter);

    // Check if document has multiple pages
    const hasMultiplePages = await mobilePage.evaluate(() => {
      const el = document.querySelector('#pdf-page-2');
      return !!el;
    });
    console.log(`7. Document has multiple pages: ${hasMultiplePages}`);

    if (hasMultiplePages) {
      // Test jumping to next page with chevron
      const nextBtn = mobilePage.locator('button[aria-label="Next Page"]');
      await nextBtn.click();
      await mobilePage.waitForTimeout(600); // allow smooth scroll

      const scrolledCounter = await mobilePage.locator('span.font-mono:has-text("Page")').first().innerText();
      console.log('8. Page counter after clicking next:', scrolledCounter);

      // Test continuous vertical scrolling
      await mobilePage.evaluate(() => {
        const container = document.querySelector('div[style*="pan-x pan-y"]');
        if (container) {
          container.scrollTop = 0;
        }
      });
      await mobilePage.waitForTimeout(400);
    }

    // Step 7: Verify Zoom In and Horizontal Panning
    const zoomInBtn = mobilePage.locator('button[aria-label="Zoom In"]');
    await zoomInBtn.click();
    await mobilePage.waitForTimeout(200);
    await zoomInBtn.click();
    await mobilePage.waitForTimeout(500);

    const scrollMetrics = await mobilePage.evaluate(() => {
      const container = document.querySelector('div[style*="pan-x pan-y"]');
      return {
        clientWidth: container ? container.clientWidth : 0,
        scrollWidth: container ? container.scrollWidth : 0,
        canScrollHorizontally: container ? container.scrollWidth > container.clientWidth : false,
      };
    });
    console.log('9. Scroll metrics at zoomed state:', scrollMetrics);
    if (!scrollMetrics.canScrollHorizontally) {
      throw new Error(`Expected horizontal scroll to be enabled when zoomed in! Metrics: ${JSON.stringify(scrollMetrics)}`);
    }
    console.log('✓ Horizontal scrolling and zoom sizing verified active!');

    // Test horizontal scroll navigation
    const canPanX = await mobilePage.evaluate(() => {
      const container = document.querySelector('div[style*="pan-x pan-y"]');
      if (!container) return false;
      container.scrollLeft = 50;
      return container.scrollLeft > 0;
    });
    console.log(`10. Can pan horizontally: ${canPanX}`);
    if (!canPanX) {
      throw new Error('Horizontal scroll failed to pan content!');
    }
    console.log('✓ 2D panning verified!');

    // Test Fit to Width
    const fitWidthBtn = mobilePage.locator('button[aria-label="Fit to Width"]');
    await fitWidthBtn.click();
    await mobilePage.waitForTimeout(400);

    // Capture mobile screenshot
    const mobileScreenshotPath = path.join(ARTIFACTS_DIR, 'pdf_modal_phase34_mobile.png');
    await mobilePage.screenshot({ path: mobileScreenshotPath });
    console.log(`11. Captured mobile screenshot: ${mobileScreenshotPath}`);

    // Step 8: Close modal and verify viewport meta is restored
    await closeBtn.click();
    await mobilePage.waitForTimeout(300);

    const restoredMeta = await mobilePage.evaluate(() => {
      const meta = document.querySelector('meta[name="viewport"]');
      return meta ? meta.getAttribute('content') : null;
    });
    console.log('12. Restored viewport meta content:', restoredMeta);
    if (restoredMeta?.includes('user-scalable=no')) {
      throw new Error(`Expected viewport meta to be restored, but user-scalable=no is still present: ${restoredMeta}`);
    }
    console.log('✓ Viewport meta restored perfectly after closing modal!');

    await mobileContext.close();

    // ----------------------------------------------------
    // TEST 2: Desktop Viewport (1280x800) - Continuous Scroll & Full Fidelity
    // ----------------------------------------------------
    console.log('\n--- Test 2: Desktop Viewport (1280x800) ---');
    const desktopContext = await browser.newContext({
      viewport: { width: 1280, height: 800 },
    });
    const desktopPage = await desktopContext.newPage();
    await desktopPage.goto(BASE_URL, { waitUntil: 'networkidle' });

    // Open first document preview
    const desktopPreviewBtn = desktopPage.locator('button:has-text("Preview"), button[title*="Preview"]').first();
    await desktopPreviewBtn.click();

    await desktopPage.locator('div[role="dialog"]').waitFor({ state: 'visible', timeout: 5000 });
    const desktopPage1 = desktopPage.locator('#pdf-page-1');
    await desktopPage1.waitFor({ state: 'visible', timeout: 15000 });
    await desktopPage1.locator('canvas').waitFor({ state: 'visible', timeout: 15000 });

    console.log('1. Desktop modal rendered with canvas.');

    // Capture desktop screenshot
    const desktopScreenshotPath = path.join(ARTIFACTS_DIR, 'pdf_modal_phase34_desktop.png');
    await desktopPage.screenshot({ path: desktopScreenshotPath });
    console.log(`2. Captured desktop screenshot: ${desktopScreenshotPath}`);

    await desktopContext.close();

    console.log('\n==========================================');
    console.log('ALL PHASE 34 PLAYWRIGHT VERIFICATION CHECKS PASSED!');
    console.log('==========================================');

  } catch (err) {
    console.error('VERIFICATION FAILED:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runVerification();
