// notifications_playwright.spec.js
// Playwright validation for TripSetGo Travel Activity Center
import { test, expect } from '@playwright/test';
import path from 'path';

const artifactsDir = 'C:/Users/ASUS/.gemini/antigravity-ide/brain/c63e375c-42f5-49c0-8860-91c514e7f45c';

// Helper for client-side navigation to the Notifications page
async function navigateToNotificationsPage(page) {
  const hamburger = page.locator('button[aria-label="Toggle menu"]');
  if (await hamburger.isVisible()) {
    console.log('🍔 Hamburger menu is visible. Clicking it to reveal sidebar...');
    await hamburger.click();
    await page.waitForTimeout(500);
  }
  console.log('🔔 Clicking Travel Activity Center link...');
  await page.waitForSelector('a[href="/dashboard/notifications"]');
  await page.$eval('a[href="/dashboard/notifications"]', el => el.click());
  await page.waitForURL('**/dashboard/notifications');
  await page.waitForTimeout(1000); // Wait for API loading states
}

test.describe('TripSetGo Travel Activity Center Validation', () => {

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

    await navigateToNotificationsPage(page);

    // Verify notifications elements are visible
    await expect(page.locator('h1:has-text("Activity Center")')).toBeVisible();
    await expect(page.locator('button#tab-trigger-all')).toBeVisible();
    await expect(page.locator('button#tab-trigger-actionable')).toBeVisible();
    console.log('✅ Notifications Header and Tab triggers are visible.');

    // Switch to Actionable tab
    console.log('🔔 Toggling Action Required Tab...');
    await page.click('button#tab-trigger-actionable');
    await page.waitForTimeout(500);

    const screenshotPath = path.join(artifactsDir, 'notifications_desktop_verification.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`📸 Saved Desktop screenshot to: ${screenshotPath}`);
  });

  test('Tablet Viewport Verification', async ({ page }) => {
    console.log('📟 Setting Tablet viewport (768x1024)...');
    await page.setViewportSize({ width: 768, height: 1024 });

    await navigateToNotificationsPage(page);

    await expect(page.locator('button#tab-trigger-all')).toBeVisible();

    const screenshotPath = path.join(artifactsDir, 'notifications_tablet_verification.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`📸 Saved Tablet screenshot to: ${screenshotPath}`);
  });

  test('Mobile Viewport Verification', async ({ page }) => {
    console.log('📱 Setting Mobile viewport (375x667)...');
    await page.setViewportSize({ width: 375, height: 667 });

    await navigateToNotificationsPage(page);

    await expect(page.locator('button#tab-trigger-all')).toBeVisible();

    const screenshotPath = path.join(artifactsDir, 'notifications_mobile_verification.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`📸 Saved Mobile screenshot to: ${screenshotPath}`);
  });
});
