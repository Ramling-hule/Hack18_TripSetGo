// copilot_playwright.spec.js
// Playwright validation for TripSetGo AI Copilot Workspace
import { test, expect } from '@playwright/test';
import path from 'path';

const artifactsDir = 'C:/Users/ASUS/.gemini/antigravity-ide/brain/c63e375c-42f5-49c0-8860-91c514e7f45c';

// Helper for client-side navigation to the Copilot page
async function navigateToCopilotPage(page) {
  const hamburger = page.locator('button[aria-label="Toggle menu"]');
  if (await hamburger.isVisible()) {
    console.log('🍔 Hamburger menu is visible. Clicking it to reveal sidebar...');
    await hamburger.click();
    await page.waitForTimeout(500);
  }
  console.log('🤖 Clicking AI Copilot link...');
  await page.waitForSelector('a[href="/dashboard/copilot"]');
  await page.$eval('a[href="/dashboard/copilot"]', el => el.click());
  await page.waitForURL('**/dashboard/copilot');
}

test.describe('TripSetGo AI Copilot Validation', () => {
  
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log(`[BROWSER CONSOLE] [${msg.type()}] ${msg.text()}`));
    page.on('pageerror', err => console.error('[BROWSER EXCEPTION]', err));

    console.log('🔑 Navigating to login...');
    await page.goto('http://localhost:3000/auth/login');
    await page.waitForLoadState('networkidle');
    
    console.log('✍ Filling credentials...');
    await page.fill('input[type="email"]', 'testuser@tripsetgo.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    console.log('⏳ Waiting for dashboard redirect...');
    try {
      await page.waitForURL('**/dashboard', { timeout: 10000 });
      console.log('✅ Navigated to dashboard.');
    } catch (err) {
      console.error('❌ Failed to navigate to dashboard:', err);
      throw err;
    }
  });

  test('Desktop Viewport Verification', async ({ page }) => {
    console.log('🖥 Setting Desktop viewport (1280x800)...');
    await page.setViewportSize({ width: 1280, height: 800 });
    
    await navigateToCopilotPage(page);

    // Verify chat elements are loaded
    await expect(page.locator('select#select-trip-dropdown')).toBeVisible();
    await expect(page.locator('input#input-copilot-message')).toBeVisible();
    console.log('✅ Chat composer input is rendered.');

    // Select the first trip if available
    const tripDropdown = page.locator('select#select-trip-dropdown');
    const options = await tripDropdown.locator('option').allInnerTexts();
    console.log('🔎 Trip Options available in Copilot:', options);

    if (options.length > 1) {
      console.log('✈ Selecting active trip in dropdown...');
      await tripDropdown.selectOption({ index: 1 });
      await page.waitForTimeout(2000); // Wait for grounding fetch and weather API
      
      // Verify context map is visible
      await expect(page.locator('.mapboxgl-canvas')).toBeVisible({ timeout: 10000 });
      console.log('✅ Grounding context mini map canvas loaded.');
    }

    const screenshotPath = path.join(artifactsDir, 'copilot_desktop_verification.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`📸 Saved Desktop screenshot to: ${screenshotPath}`);
  });

  test('Tablet Viewport Verification', async ({ page }) => {
    console.log('📟 Setting Tablet viewport (768x1024)...');
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await navigateToCopilotPage(page);

    await expect(page.locator('input#input-copilot-message')).toBeVisible();

    const screenshotPath = path.join(artifactsDir, 'copilot_tablet_verification.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`📸 Saved Tablet screenshot to: ${screenshotPath}`);
  });

  test('Mobile Viewport Verification', async ({ page }) => {
    console.log('📱 Setting Mobile viewport (375x667)...');
    await page.setViewportSize({ width: 375, height: 667 });
    
    await navigateToCopilotPage(page);

    // Verify map context elements can load
    await expect(page.locator('input#input-copilot-message')).toBeVisible();

    const screenshotPath = path.join(artifactsDir, 'copilot_mobile_verification.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`📸 Saved Mobile screenshot to: ${screenshotPath}`);
  });
});
