// planner_playwright.spec.js
import { test, expect } from '@playwright/test';
import path from 'path';

const artifactsDir = 'C:/Users/ASUS/.gemini/antigravity-ide/brain/bbeeedf4-d1ed-4803-b4d3-5396ed128458';

test('Verify Planner Redesign', async ({ page }) => {
  console.log('🔑 Navigating to login...');
  await page.goto('http://localhost:3000/auth/login');
  await page.waitForLoadState('networkidle');
  
  console.log('✍ Filling credentials...');
  await page.fill('input[type="email"]', 'testuser@tripsetgo.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  console.log('⏳ Waiting for dashboard...');
  await page.waitForURL('**/dashboard');
  
  console.log('✈ Navigating to planner...');
  await page.goto('http://localhost:3000/dashboard/planner');
  await page.waitForLoadState('networkidle');
  
  await page.waitForSelector('form');
  console.log('✅ Form loaded in browser.');
  
  // Inspect Solo button class
  const soloButton = page.locator('button:has-text("Solo")');
  if (await soloButton.count() > 0) {
    const className = await soloButton.getAttribute('class');
    console.log(`🔎 SOLO BUTTON CLASS: "${className}"`);
  } else {
    // Check if it's a div chip
    const soloDiv = page.locator('div:has-text("Solo")');
    const className = await soloDiv.first().getAttribute('class');
    console.log(`🔎 SOLO CHIP CLASS: "${className}"`);
  }
  
  const screenshotPath = path.join(artifactsDir, 'planner_playwright_test.png');
  await page.screenshot({ path: screenshotPath });
  console.log(`📸 Saved screenshot to: ${screenshotPath}`);
});
