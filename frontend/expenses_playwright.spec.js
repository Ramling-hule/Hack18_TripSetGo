// expenses_playwright.spec.js
// Playwright validation for TripSetGo collaborative Expenses Workspace
import { test, expect } from '@playwright/test';
import path from 'path';

const artifactsDir = 'C:/Users/ASUS/.gemini/antigravity-ide/brain/c63e375c-42f5-49c0-8860-91c514e7f45c';

// Helper for client-side navigation to the Expenses page
async function navigateToExpensesPage(page) {
  const hamburger = page.locator('button[aria-label="Toggle menu"]');
  if (await hamburger.isVisible()) {
    console.log('🍔 Hamburger menu is visible. Clicking it to reveal sidebar...');
    await hamburger.click();
    await page.waitForTimeout(500);
  }
  console.log('💰 Clicking Group Expenses link...');
  await page.waitForSelector('a[href="/dashboard/expenses"]');
  await page.$eval('a[href="/dashboard/expenses"]', el => el.click());
  await page.waitForURL('**/dashboard/expenses');

  console.log('⏳ Waiting for loading skeletons to resolve...');
  await page.waitForSelector('button:has-text("Create your first group"), button#tab-trigger-ledger');

  const emptyStateBtn = page.locator('button:has-text("Create your first group")');
  if (await emptyStateBtn.isVisible()) {
    console.log('👥 Empty state detected. Creating a test expense group...');
    await emptyStateBtn.click();
    await page.waitForSelector('input#input-newgroup-name');
    await page.fill('input#input-newgroup-name', 'Playwright Test Group');
    await page.click('button[type="submit"]:has-text("Create Group")');
    await page.waitForSelector('button#tab-trigger-ledger');
  }
}

test.describe('TripSetGo collaborative Expenses Validation', () => {

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

    await navigateToExpensesPage(page);

    // Verify main components are present
    await expect(page.locator('h1:has-text("Group")')).toBeVisible();
    await expect(page.locator('button#tab-trigger-ledger')).toBeVisible();
    await expect(page.locator('button#tab-trigger-insights')).toBeVisible();
    console.log('✅ Header title and Tab triggers are visible.');

    // Settle-up or ledger lists verification
    await expect(page.locator('input#input-expense-search')).toBeVisible();
    console.log('✅ Expense search filters are rendered.');

    // Switch to Insights Tab
    console.log('📊 Toggling Spending Insights Tab...');
    await page.click('button#tab-trigger-insights');
    await page.waitForTimeout(500);

    // Confirm insights containers are shown
    await expect(page.locator('h4:has-text("Breakdown Summary")')).toBeVisible();
    console.log('✅ Breakdown Summary panel is visible on Spending Insights Tab.');

    const screenshotPath = path.join(artifactsDir, 'expenses_desktop_verification.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`📸 Saved Desktop screenshot to: ${screenshotPath}`);
  });

  test('Tablet Viewport Verification', async ({ page }) => {
    console.log('📟 Setting Tablet viewport (768x1024)...');
    await page.setViewportSize({ width: 768, height: 1024 });

    await navigateToExpensesPage(page);

    await expect(page.locator('button#tab-trigger-ledger')).toBeVisible();

    const screenshotPath = path.join(artifactsDir, 'expenses_tablet_verification.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`📸 Saved Tablet screenshot to: ${screenshotPath}`);
  });

  test('Mobile Viewport Verification', async ({ page }) => {
    console.log('📱 Setting Mobile viewport (375x667)...');
    await page.setViewportSize({ width: 375, height: 667 });

    await navigateToExpensesPage(page);

    await expect(page.locator('button#tab-trigger-ledger')).toBeVisible();

    const screenshotPath = path.join(artifactsDir, 'expenses_mobile_verification.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`📸 Saved Mobile screenshot to: ${screenshotPath}`);
  });
});
