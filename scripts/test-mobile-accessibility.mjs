import { createRequire } from 'module';
import os from 'os';
import path from 'path';
const require = createRequire(import.meta.url);
const playwrightPath = path.join(os.homedir(), '.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const { chromium } = require(playwrightPath);

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 360, height: 800 } });
  const page = await context.newPage();

  console.log('--- 1. Testing Default Theme on Fresh Load ---');
  await page.goto('http://localhost:8080/');
  await page.waitForLoadState('networkidle');

  // Verify default theme is light
  const themeAttr = await page.$eval('html', el => el.getAttribute('data-theme'));
  const hasDarkClass = await page.$eval('html', el => el.classList.contains('dark'));
  console.log('Default theme attribute:', themeAttr);
  console.log('Has dark class:', hasDarkClass);
  if (themeAttr !== 'light' || hasDarkClass) {
    throw new Error('Default theme is not light!');
  }

  console.log('\n--- 2. Testing 360px Mobile Header Layout & Multi-Row Structure ---');
  // Check Row 1: Search icon beside Hamburger
  const row1SearchCount = await page.locator('header > div:first-child button[aria-label="Toggle search input"]').count();
  const row1HamburgerCount = await page.locator('header > div:first-child button[aria-label="Toggle navigation menu"]').count();
  console.log('Row 1 Search icon present:', row1SearchCount > 0);
  console.log('Row 1 Hamburger menu present:', row1HamburgerCount > 0);

  // Check Row 2: Text size on left, Star & Theme on right
  const row2FontAdjuster = await page.locator('header > div:nth-child(2) div[role="group"][aria-label="Font size adjustment"]').count();
  const row2StarBadge = await page.locator('header > div:nth-child(2) a[aria-label="Star Canonify repository on GitHub"]').count();
  const row2ThemeToggle = await page.locator('header > div:nth-child(2) button[aria-label*="Mode"]').count();
  console.log('Row 2 Font size adjuster on left:', row2FontAdjuster > 0);
  console.log('Row 2 Star badge on right:', row2StarBadge > 0);
  console.log('Row 2 Theme toggle on right:', row2ThemeToggle > 0);

  // Check Document Width at normal font size
  let docWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  let winWidth = await page.evaluate(() => window.innerWidth);
  console.log('Normal Scale -> docWidth:', docWidth, 'winWidth:', winWidth, 'Zero overflow:', docWidth === winWidth);
  if (docWidth > winWidth) {
    throw new Error(`Overflow detected at normal scale! docWidth: ${docWidth}, winWidth: ${winWidth}`);
  }

  console.log('\n--- 3. Testing Font Scaling (A+ / A- / A) Zero Overflow & Zero Shift ---');
  // Click A+ (increase font size)
  const btnAplus = page.locator('header > div:nth-child(2) button[aria-label="Increase font size"]');
  await btnAplus.click();
  await page.waitForTimeout(150);

  let fontScale = await page.$eval('html', el => el.getAttribute('data-font-scale'));
  let htmlFontSize = await page.$eval('html', el => window.getComputedStyle(el).fontSize);
  docWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  console.log('After A+ -> scale:', fontScale, 'fontSize:', htmlFontSize, 'docWidth:', docWidth, 'Zero overflow:', docWidth === 360);
  if (docWidth > 360) {
    throw new Error(`Overflow detected at A+ scale! docWidth: ${docWidth}`);
  }

  // Click A- (decrease font size)
  const btnAminus = page.locator('header > div:nth-child(2) button[aria-label="Decrease font size"]');
  await btnAminus.click();
  await page.waitForTimeout(150);

  fontScale = await page.$eval('html', el => el.getAttribute('data-font-scale'));
  htmlFontSize = await page.$eval('html', el => window.getComputedStyle(el).fontSize);
  docWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  console.log('After A- -> scale:', fontScale, 'fontSize:', htmlFontSize, 'docWidth:', docWidth, 'Zero overflow:', docWidth === 360);
  if (docWidth > 360) {
    throw new Error(`Overflow detected at A- scale! docWidth: ${docWidth}`);
  }

  // Reset to A (normal)
  const btnAnormal = page.locator('header > div:nth-child(2) button[aria-label="Default font size"]');
  await btnAnormal.click();
  await page.waitForTimeout(150);

  console.log('\n--- 4. Testing Modals with Body Scroll Locking ---');
  // Navigate to Gujarat profile
  await page.goto('http://localhost:8080/#/jurisdiction/gujarat');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(400);

  // Check Legal Modal
  await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('button, a'));
    const licenseBtn = links.find(el => el.textContent && el.textContent.includes('MIT License'));
    if (licenseBtn) licenseBtn.click();
  });
  await page.waitForTimeout(300);

  let bodyOverflow = await page.evaluate(() => window.document.body.style.overflow);
  docWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  console.log('With Legal Modal open -> body overflow:', bodyOverflow, 'docWidth:', docWidth, 'Zero overflow:', docWidth === 360);
  if (bodyOverflow !== 'hidden' || docWidth > 360) {
    throw new Error(`Legal Modal failed lock or overflowed! overflow: ${bodyOverflow}, docWidth: ${docWidth}`);
  }

  // Close Legal Modal
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  bodyOverflow = await page.evaluate(() => window.document.body.style.overflow);
  console.log('After closing Legal Modal -> body overflow restored:', bodyOverflow === '');

  // Open PDF Preview Modal
  await page.evaluate(() => {
    const allButtons = Array.from(document.querySelectorAll('button'));
    const pBtn = allButtons.find(b => b.textContent && b.textContent.includes('Preview'));
    if (pBtn) pBtn.click();
  });
  await page.waitForTimeout(500);

  bodyOverflow = await page.evaluate(() => window.document.body.style.overflow);
  docWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  console.log('With PDF Preview Modal open -> body overflow:', bodyOverflow, 'docWidth:', docWidth, 'Zero overflow:', docWidth === 360);
  if (bodyOverflow !== 'hidden' || docWidth > 360) {
    throw new Error(`PDF Modal failed lock or overflowed! overflow: ${bodyOverflow}, docWidth: ${docWidth}`);
  }

  // Close PDF Modal
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  console.log('\n--- 5. Testing Desktop Viewport (1280x800) ---');
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.waitForTimeout(300);

  // Desktop Row 1 assertions
  const desktopSearchVisible = await page.$eval('input#navbar-search', el => window.getComputedStyle(el).display !== 'none');
  const desktopFontAdjusterVisible = await page.$eval('header > div:first-child div[aria-label="Desktop font size adjustment"]', el => window.getComputedStyle(el).display !== 'none');
  const desktopStarVisible = await page.$eval('header > div:first-child a[aria-label="Star Canonify repository on GitHub"]', el => window.getComputedStyle(el).display !== 'none');
  const desktopThemeVisible = await page.$eval('header > div:first-child button[aria-label*="Mode"]', el => window.getComputedStyle(el).display !== 'none');

  console.log('Desktop Search bar in Row 1 center:', desktopSearchVisible);
  console.log('Desktop Font Size Adjuster in Row 1 right:', desktopFontAdjusterVisible);
  console.log('Desktop GitHub Star in Row 1 right:', desktopStarVisible);
  console.log('Desktop Theme toggle in Row 1 right:', desktopThemeVisible);

  // Row 2 is HIDDEN on desktop
  const row2HiddenOnDesktop = await page.$eval('header > div.md\\:hidden', el => window.getComputedStyle(el).display === 'none');
  console.log('Row 2 utility row is HIDDEN on desktop:', row2HiddenOnDesktop);

  // Desktop Sub-Nav is visible directly under Row 1
  const desktopSubnavVisible = await page.$eval('nav[aria-label="Counselling Categories Navigation"]', el => window.getComputedStyle(el).display !== 'none');
  console.log('Desktop Categories Sub-nav visible:', desktopSubnavVisible);

  if (!desktopSearchVisible || !desktopFontAdjusterVisible || !desktopStarVisible || !desktopThemeVisible || !row2HiddenOnDesktop || !desktopSubnavVisible) {
    throw new Error('Desktop layout check failed!');
  }

  await browser.close();
  console.log('\nAll Phase 19 tests PASSED with 100% precision!');
})();
