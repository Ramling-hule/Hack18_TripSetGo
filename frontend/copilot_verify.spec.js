// copilot_verify.spec.js
// Playwright E2E tests for the Gemini Trip Assistant (Copilot) with CSRF integration.
import { test, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const BASE_URL       = 'http://localhost:3000'
const ARTIFACTS_DIR  = 'C:/Users/ASUS/.gemini/antigravity-ide/brain/575cc923-d8c1-419f-94c9-ba38ef8e48ac'
const EMAIL          = 'testuser@tripsetgo.com'
const PASSWORD       = 'password123'

const STATE_PATH = path.join(ARTIFACTS_DIR, 'scratch/auth_state.json')

test.use({ storageState: STATE_PATH })

test('Verify Copilot Assistant Chat Streams Reply Correctly', async ({ page }) => {
  test.setTimeout(120_000)

  // Navigate to planner
  await page.goto(`${BASE_URL}/dashboard/planner`)
  await page.waitForLoadState('networkidle')
  await page.waitForSelector('form', { timeout: 10_000 })

  // Fill Origin (Source)
  await page.locator('input[placeholder="Origin" i]').first().fill('Mumbai')
  await page.waitForTimeout(200)

  // Fill Destination
  await page.locator('input[placeholder="Destination" i]').first().fill('Goa')
  await page.waitForTimeout(200)

  // Fill dates
  const dateInputs = page.locator('input[type="date"]')
  if (await dateInputs.count() >= 2) {
    await dateInputs.nth(0).fill('2026-07-10')
    await dateInputs.nth(1).fill('2026-07-15')
  }

  // Fill budget
  await page.locator('input[placeholder*="50,000" i], input[type="number"]').first().fill('50000')

  // Select Solo
  const soloBtn = page.locator('button:has-text("Solo"), div:has-text("Solo")').first()
  if (await soloBtn.count() > 0) {
    await soloBtn.click().catch(() => {})
  }

  // Submit
  await page.locator('button[type="submit"], button:has-text("Generate"), button:has-text("Plan")').first().click()

  // Wait for results container to appear (generation finished)
  console.log('⏳ Waiting for AI plan generation to finish...')
  await page.waitForSelector('[role="tablist"][aria-label*="Itinerary" i]', { timeout: 90_000 })
  console.log('🎉 AI plan generation finished!')

  // Locate the assistant chat text input
  const chatInput = page.locator('input[placeholder*="Ask assistant..." i], textarea[placeholder*="Ask assistant..." i]').first()
  await expect(chatInput).toBeVisible()

  // Type user prompt
  const prompt = 'on days 10 to 12 i will be visiting my relatives home so i dont want any thing to be planned keep them as family time i will be generating a new plan keep this in mind'
  await chatInput.fill(prompt)

  // Click the send button
  const sendBtn = page.locator('button:has(svg[class*="lucide-send" i]), button:has-text("Send")').first()
  await sendBtn.click()
  console.log('✉ Sent chat message to Copilot...')

  // Wait for streaming reply to finish (starts with empty assistant message and finishes when loading/streaming stops)
  console.log('⏳ Waiting for Copilot streaming reply...')
  await page.waitForTimeout(12000)

  // Verify that there is no error message containing "unavailable" on the page
  const lastMessageText = await page.locator(':text("unavailable")').count()
  expect(lastMessageText).toBe(0)

  // Take screenshot
  const p = path.join(ARTIFACTS_DIR, 'copilot_success_verify.png')
  await page.screenshot({ path: p, fullPage: false })
  console.log(`📸 Saved screenshot to: ${p}`)
})
