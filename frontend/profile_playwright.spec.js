// profile_playwright.spec.js
// Playwright validation for TripSetGo Travel Profile Identity
import { test, expect } from '@playwright/test';
import path from 'path';

const artifactsDir = 'C:/Users/ASUS/.gemini/antigravity-ide/brain/c63e375c-42f5-49c0-8860-91c514e7f45c';

// Helper for client-side navigation to the Profile page
async function navigateToProfilePage(page) {
  const hamburger = page.locator('button[aria-label="Toggle menu"]');
  if (await hamburger.isVisible()) {
    console.log('🍔 Hamburger menu is visible. Clicking it to reveal sidebar...');
    await hamburger.click();
    await page.waitForTimeout(500);
  }
  console.log('👤 Clicking Travel Profile link...');
  await page.waitForSelector('a[href="/dashboard/profile"]');
  await page.$eval('a[href="/dashboard/profile"]', el => el.click());
  await page.waitForURL('**/dashboard/profile');
  await page.waitForTimeout(1000); // Wait for components to mount
}

test.describe('TripSetGo Travel Profile Validation', () => {

  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log(`[BROWSER CONSOLE] [${msg.type()}] ${msg.text()}`));
    page.on('pageerror', err => console.error('[BROWSER EXCEPTION]', err));

    console.log('🔑 Navigating to login...');
    await page.goto('http://localhost:3000/auth/login');
    await page.waitForSelector('input[type="email"]');

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

    await navigateToProfilePage(page);

    // Verify profile identity card is visible
    await expect(page.locator('h1:has-text("Profile")')).toBeVisible();
    await expect(page.locator('button#tab-trigger-identity')).toBeVisible();
    await expect(page.locator('button#tab-trigger-settings')).toBeVisible();
    console.log('✅ Profile Header and Tab triggers are visible.');

    // Switch to settings tab
    console.log('⚙️ Toggling Account Settings Tab...');
    await page.click('button#tab-trigger-settings');
    await page.waitForTimeout(500);

    // Confirm settings items are shown
    await expect(page.locator('h3:has-text("Profile Settings")')).toBeVisible();
    await expect(page.locator('input[value="testuser@tripsetgo.com"]')).toBeDisabled();
    console.log('✅ Settings fields and email block verified.');

    const screenshotPath = path.join(artifactsDir, 'profile_desktop_verification.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`📸 Saved Desktop screenshot to: ${screenshotPath}`);
  });

  test('Tablet Viewport Verification', async ({ page }) => {
    console.log('📟 Setting Tablet viewport (768x1024)...');
    await page.setViewportSize({ width: 768, height: 1024 });

    await navigateToProfilePage(page);

    await expect(page.locator('button#tab-trigger-identity')).toBeVisible();

    const screenshotPath = path.join(artifactsDir, 'profile_tablet_verification.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`📸 Saved Tablet screenshot to: ${screenshotPath}`);
  });

  test('Mobile Viewport Verification', async ({ page }) => {
    console.log('📱 Setting Mobile viewport (375x667)...');
    await page.setViewportSize({ width: 375, height: 667 });

    await navigateToProfilePage(page);

    await expect(page.locator('button#tab-trigger-identity')).toBeVisible();

    const screenshotPath = path.join(artifactsDir, 'profile_mobile_verification.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`📸 Saved Mobile screenshot to: ${screenshotPath}`);
  });
});
