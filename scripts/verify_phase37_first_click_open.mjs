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
const BASE_URL = 'http://localhost:4157';

async function verifyFirstClickAndNullTransport() {
  console.log(`Starting Phase 37 First-Click & Worker Transport Verification at ${BASE_URL}...`);
  const browser = await chromium.launch({ headless: true });

  const consoleErrors = [];
  const consoleWarnings = [];
  const pageErrors = [];

  try {
    const context = await browser.newContext({
      viewport: { width: 360, height: 800 },
      isMobile: true,
      hasTouch: true,
      userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-A556B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36'
    });
    const page = await context.newPage();

    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'error') {
        console.log(`[BROWSER ERROR] ${text}`);
        consoleErrors.push(text);
      } else if (msg.type() === 'warning') {
        consoleWarnings.push(text);
      }
    });

    page.on('pageerror', err => {
      console.log(`[PAGE ERROR] ${err.message}`);
      pageErrors.push(err.message);
    });

    // ------------------------------------------------------------------
    // TEST 1: Open PDF Preview Modal on First Click & Verify Persistence
    // ------------------------------------------------------------------
    console.log('\n--- Test 1: Open PDF Modal on First Click & Verify No Premature Self-Closure ---');
    await page.goto(`${BASE_URL}/#/jurisdiction/arunachal-pradesh`, { waitUntil: 'networkidle' });
    console.log('1. Loaded Arunachal Pradesh jurisdiction page.');

    const previewBtn = page.locator('button:has-text("Preview"), button[title*="Preview"]').first();
    await previewBtn.waitFor({ state: 'visible', timeout: 5000 });

    console.log('2. Clicking "Preview" button ONCE...');
    await previewBtn.click();

    const pdfModal = page.locator('div[role="dialog"]');
    await pdfModal.waitFor({ state: 'visible', timeout: 3000 });
    console.log('✓ Modal opened immediately on first click!');

    // Wait 3 seconds to let PDF metadata load, numPages update, and ensure effect cleanup doesn't close modal
    console.log('3. Waiting 3 seconds to verify modal STAYS open after PDF metadata & numPages update...');
    await page.waitForTimeout(3000);

    const isStillVisible = await pdfModal.isVisible();
    if (!isStillVisible) {
      throw new Error('FAILED: Modal closed itself prematurely after metadata loaded!');
    }
    console.log('✓ Modal remained open stably! No premature history.back() self-closure occurred.');

    // Verify page indicator updates with actual total pages (e.g. "Page 1 of 34")
    const pageIndicator = page.locator('text=/Page \\d+ of \\d+/');
    await pageIndicator.waitFor({ state: 'visible', timeout: 5000 });
    const indicatorText = await pageIndicator.textContent();
    console.log(`✓ Page indicator rendered: "${indicatorText}"`);

    // Verify canvas rendered
    const firstCanvas = page.locator('canvas').first();
    await firstCanvas.waitFor({ state: 'visible', timeout: 8000 });
    const canvasBox = await firstCanvas.boundingBox();
    console.log(`✓ First PDF page canvas rendered with dimensions: ${canvasBox ? `${canvasBox.width}x${canvasBox.height}` : 'null'}`);
    if (!canvasBox || canvasBox.width <= 0 || canvasBox.height <= 0) {
      throw new Error('FAILED: First PDF page canvas failed to render valid dimensions');
    }

    // Capture screenshot of stably open modal on mobile
    const screenshotPath = path.join(ARTIFACTS_DIR, 'pdf_modal_first_click_verified.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`✓ Saved mobile screenshot to: ${screenshotPath}`);

    // Check for sendWithPromise error
    const sendWithPromiseErrors = consoleErrors.filter(e => e.includes('sendWithPromise'));
    if (sendWithPromiseErrors.length > 0) {
      throw new Error(`FAILED: Detected ${sendWithPromiseErrors.length} sendWithPromise errors in console: ${JSON.stringify(sendWithPromiseErrors)}`);
    }
    console.log('✓ Zero sendWithPromise errors detected during initial load.');

    // ------------------------------------------------------------------
    // TEST 2: Abrupt Closure & Teardown While Rendering
    // ------------------------------------------------------------------
    console.log('\n--- Test 2: Abrupt Modal Closure & Worker Teardown Cleanliness ---');
    const closeBtn = page.locator('button[aria-label="Close Preview"]');
    await closeBtn.click();
    await page.waitForTimeout(500);

    const isClosed = !(await pdfModal.isVisible());
    console.log('✓ Modal closed via Close button. Is closed?', isClosed);
    if (!isClosed) {
      throw new Error('FAILED: Modal did not close when Close button clicked');
    }

    // Immediately reopen modal on first click again
    console.log('4. Re-opening modal immediately on first click...');
    await previewBtn.click();
    await pdfModal.waitFor({ state: 'visible', timeout: 3000 });
    console.log('✓ Modal re-opened on first click cleanly.');

    // Immediately close modal after 200ms while worker is in flight
    await page.waitForTimeout(200);
    console.log('5. Closing modal abruptly while PDF worker is in flight...');
    await page.goBack(); // Test back-swipe close as well
    await page.waitForTimeout(500);

    const isClosedAfterBack = !(await pdfModal.isVisible());
    console.log('✓ Modal closed via back gesture. Is closed?', isClosedAfterBack);
    if (!isClosedAfterBack) {
      throw new Error('FAILED: Modal did not close on back gesture');
    }

    // Check console errors again
    const finalSendWithPromiseErrors = consoleErrors.filter(e => e.includes('sendWithPromise'));
    const finalNullTransportErrors = consoleErrors.filter(e => e.includes('Cannot read properties of null'));
    console.log(`\nFinal Error Audit:`);
    console.log(`- Total console errors: ${consoleErrors.length}`);
    console.log(`- sendWithPromise errors: ${finalSendWithPromiseErrors.length}`);
    console.log(`- Null transport errors: ${finalNullTransportErrors.length}`);
    console.log(`- Uncaught page errors: ${pageErrors.length}`);

    if (finalSendWithPromiseErrors.length > 0 || finalNullTransportErrors.length > 0 || pageErrors.length > 0) {
      throw new Error(`FAILED: Console contains uncaught worker transport errors:\nErrors: ${JSON.stringify([...finalSendWithPromiseErrors, ...finalNullTransportErrors, ...pageErrors])}`);
    }

    console.log('\n======================================================');
    console.log('ALL PHASE 37 FIRST-CLICK & TRANSPORT TESTS PASSED (100%)');
    console.log('======================================================');

    await context.close();
  } catch (err) {
    console.error('VERIFICATION FAILED:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

verifyFirstClickAndNullTransport();
