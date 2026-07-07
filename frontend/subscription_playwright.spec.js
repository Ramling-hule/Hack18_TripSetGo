// subscription_playwright.spec.js
// Playwright validation for TripSetGo Subscription Conversion
import { test, expect } from '@playwright/test';
import path from 'path';

const artifactsDir = 'C:/Users/ASUS/.gemini/antigravity-ide/brain/c63e375c-42f5-49c0-8860-91c514e7f45c';

// Helper for client-side navigation to the Subscription page
async function navigateToSubscriptionPage(page) {
  const hamburger = page.locator('button[aria-label="Toggle menu"]');
  if (await hamburger.isVisible()) {
    console.log('🍔 Hamburger menu is visible. Clicking it to reveal sidebar...');
    await hamburger.click();
    await page.waitForTimeout(500);
  }
  console.log('💳 Clicking Premium Subscription link...');
  await page.waitForSelector('a[href="/dashboard/subscription"]');
  await page.$eval('a[href="/dashboard/subscription"]', el => el.click());
  await page.waitForURL('**/dashboard/subscription');
  await page.waitForTimeout(1000); // Wait for API loading states
}

test.describe('TripSetGo Subscription page Validation', () => {

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

    await navigateToSubscriptionPage(page);

    // Verify main headlines and pricing buttons
    await expect(page.locator('h1:has-text("Adventure Plan")')).toBeVisible();
    await expect(page.locator('button#plan-btn-pro')).toBeVisible();
    console.log('✅ Headers and Upgrade CTA verified.');

    // Toggle FAQ item
    console.log('❓ Opening first FAQ item...');
    await page.click('button#faq-0');
    await page.waitForTimeout(300);

    const screenshotPath = path.join(artifactsDir, 'subscription_desktop_verification.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`📸 Saved Desktop screenshot to: ${screenshotPath}`);
  });

  test('Tablet Viewport Verification', async ({ page }) => {
    console.log('📟 Setting Tablet viewport (768x1024)...');
    await page.setViewportSize({ width: 768, height: 1024 });

    await navigateToSubscriptionPage(page);

    await expect(page.locator('button#plan-btn-pro')).toBeVisible();

    const screenshotPath = path.join(artifactsDir, 'subscription_tablet_verification.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`📸 Saved Tablet screenshot to: ${screenshotPath}`);
  });

  test('Mobile Viewport Verification', async ({ page }) => {
    console.log('📱 Setting Mobile viewport (375x667)...');
    await page.setViewportSize({ width: 375, height: 667 });

    await navigateToSubscriptionPage(page);

    await expect(page.locator('button#plan-btn-pro')).toBeVisible();

    const screenshotPath = path.join(artifactsDir, 'subscription_mobile_verification.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`📸 Saved Mobile screenshot to: ${screenshotPath}`);
  });
});
