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

async function verifyModalBackSwipe() {
  console.log(`Starting Phase 36 Back-Swipe & Modal History Verification at ${BASE_URL}...`);
  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 },
      isMobile: true,
      hasTouch: true,
    });
    const page = await context.newPage();

    // ------------------------------------------------------------------
    // TEST 1: PDF Preview Modal Back-Swipe Trapping on a State Profile Route
    // ------------------------------------------------------------------
    console.log('\n--- Test 1: PDF Preview Modal Back-Swipe on State Profile Route ---');
    // Step 1: Start at Home
    await page.goto(BASE_URL + '/#/', { waitUntil: 'networkidle' });
    console.log('1. Loaded Home page:', page.url());

    // Step 2: Navigate to a state profile page (e.g. Andhra Pradesh)
    const stateCard = page.locator('div[role="button"]:has-text("Andhra Pradesh")').first();
    await stateCard.waitFor({ state: 'visible', timeout: 5000 });
    await stateCard.click();
    await page.waitForTimeout(400);

    const stateUrl = page.url();
    console.log('2. Navigated to state page:', stateUrl);
    if (!stateUrl.includes('jurisdiction/andhra-pradesh')) {
      throw new Error(`Expected URL to contain jurisdiction/andhra-pradesh, got: ${stateUrl}`);
    }

    // Step 3: Open PDF Preview Modal
    const previewBtn = page.locator('button:has-text("Preview"), button[title*="Preview"]').first();
    await previewBtn.waitFor({ state: 'visible', timeout: 5000 });
    await previewBtn.click();

    const pdfModal = page.locator('div[role="dialog"]');
    await pdfModal.waitFor({ state: 'visible', timeout: 5000 });
    console.log('3. PDF Preview Modal is open.');

    // Step 4: Simulate mobile back swipe / system back button (page.goBack())
    console.log('4. Performing back swipe / goBack()...');
    await page.goBack();
    await page.waitForTimeout(400);

    // Assert: Modal should be CLOSED
    const isModalOpen = await pdfModal.isVisible();
    console.log('5. Is modal still visible after back swipe?', isModalOpen);
    if (isModalOpen) {
      throw new Error('FAILED: Modal did NOT close on back swipe! It is still open.');
    }
    console.log('✓ Modal closed cleanly on back swipe!');

    // Assert: Current URL should STILL be the state page, NOT the previous Home page
    const urlAfterBack = page.url();
    console.log('6. URL after back swipe:', urlAfterBack);
    if (!urlAfterBack.includes('jurisdiction/andhra-pradesh')) {
      throw new Error(`FAILED: Back swipe navigated away from the page! Expected jurisdiction/andhra-pradesh, got: ${urlAfterBack}`);
    }
    console.log('✓ Back swipe was isolated strictly to the modal! Page route preserved.');

    // Step 5: Now that modal is closed, pressing back should navigate back to Home
    console.log('7. Performing second back swipe (with modal closed)...');
    await page.goBack();
    await page.waitForTimeout(400);
    const urlAfterSecondBack = page.url();
    console.log('8. URL after second back swipe:', urlAfterSecondBack);
    if (!urlAfterSecondBack.endsWith('#/') && !urlAfterSecondBack.endsWith(':4157/')) {
      throw new Error(`Expected to return to Home page after second back swipe, got: ${urlAfterSecondBack}`);
    }
    console.log('✓ Second back navigation correctly returned to Home page.');

    // ------------------------------------------------------------------
    // TEST 2: PDF Preview Modal UI Dismissal (Close Button) History Cleanup
    // ------------------------------------------------------------------
    console.log('\n--- Test 2: PDF Preview Modal Close Button History Cleanup ---');
    // Open modal again
    await page.goto(BASE_URL + '/#/jurisdiction/all-india', { waitUntil: 'networkidle' });
    const previewBtn2 = page.locator('button:has-text("Preview"), button[title*="Preview"]').first();
    await previewBtn2.click();
    await pdfModal.waitFor({ state: 'visible', timeout: 5000 });

    // Close via 'X' button
    const closeBtn = page.locator('button[aria-label="Close Preview"]');
    await closeBtn.click();
    await page.waitForTimeout(400);

    const isModalOpenAfterX = await pdfModal.isVisible();
    if (isModalOpenAfterX) {
      throw new Error('Modal did not close via X button');
    }
    console.log('✓ Modal closed via X button.');

    // ------------------------------------------------------------------
    // TEST 3: Legal Modal (License / Disclaimer) Back-Swipe Trapping
    // ------------------------------------------------------------------
    console.log('\n--- Test 3: Legal Modal Back-Swipe Trapping ---');
    const legalLink = page.locator('button:has-text("MIT License"), button:has-text("Disclaimer")').first();
    await legalLink.scrollIntoViewIfNeeded();
    await legalLink.click();

    const legalModal = page.locator('div[role="dialog"]');
    await legalModal.waitFor({ state: 'visible', timeout: 5000 });
    console.log('1. Legal modal is open.');

    const currentUrlBeforeLegalBack = page.url();
    await page.goBack();
    await page.waitForTimeout(400);

    const isLegalModalOpen = await legalModal.isVisible();
    console.log('2. Is legal modal still visible after back swipe?', isLegalModalOpen);
    if (isLegalModalOpen) {
      throw new Error('FAILED: Legal modal did not close on back swipe!');
    }
    console.log('✓ Legal modal closed cleanly on back swipe!');
    if (page.url() !== currentUrlBeforeLegalBack) {
      throw new Error(`URL changed unexpectedly during legal modal back swipe: ${page.url()}`);
    }
    console.log('✓ Current page route preserved after legal modal back swipe.');

    // ------------------------------------------------------------------
    // TEST 4: Navbar Mobile Menu Drawer Back-Swipe Trapping
    // ------------------------------------------------------------------
    console.log('\n--- Test 4: Navbar Mobile Menu Drawer Back-Swipe Trapping ---');
    const hamburgerBtn = page.locator('button[aria-label="Toggle navigation menu"]');
    await hamburgerBtn.click();
    await page.waitForTimeout(300);

    const mobileMenu = page.locator('#mobile-nav-drawer');
    const isMenuOpen = await mobileMenu.isVisible();
    console.log('1. Is mobile menu drawer visible?', isMenuOpen);
    if (!isMenuOpen) {
      throw new Error('Mobile menu drawer failed to open');
    }

    const currentUrlBeforeMenuBack = page.url();
    await page.goBack();
    await page.waitForTimeout(400);

    const isMenuOpenAfterBack = await mobileMenu.isVisible();
    console.log('2. Is mobile menu drawer visible after back swipe?', isMenuOpenAfterBack);
    if (isMenuOpenAfterBack) {
      throw new Error('FAILED: Mobile menu drawer did not close on back swipe!');
    }
    console.log('✓ Mobile menu drawer closed cleanly on back swipe!');
    if (page.url() !== currentUrlBeforeMenuBack) {
      throw new Error(`URL changed unexpectedly during mobile menu back swipe: ${page.url()}`);
    }
    console.log('✓ Current page route preserved after mobile menu back swipe.');

    // Capture verification screenshot
    const screenshotPath = path.join(ARTIFACTS_DIR, 'modal_back_swipe_verified.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`\nCaptured verification screenshot: ${screenshotPath}`);

    console.log('\n==========================================');
    console.log('ALL PHASE 36 BACK-SWIPE VERIFICATIONS PASSED!');
    console.log('==========================================');

    await context.close();
  } catch (err) {
    console.error('VERIFICATION FAILED:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

verifyModalBackSwipe();
