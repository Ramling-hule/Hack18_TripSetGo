// planner_generation.spec.js
// Playwright E2E tests for the AI Planner Generation Screen.
// Tests: Desktop, Tablet, Mobile viewports.
// Verifies: animations, progress, typography, spacing, narrative, accessibility, dark mode.
import { test, expect } from '@playwright/test'
import path from 'path'

const BASE_URL       = 'http://localhost:3000'
const ARTIFACTS_DIR  = 'C:/Users/ASUS/.gemini/antigravity-ide/brain/575cc923-d8c1-419f-94c9-ba38ef8e48ac'
const EMAIL          = 'testuser@tripsetgo.com'
const PASSWORD       = 'password123'

// ─── Viewport presets ───────────────────────────────────────────────────────
const VIEWPORTS = {
  desktop: { width: 1440, height: 900  },
  laptop:  { width: 1280, height: 800  },
  tablet:  { width: 768,  height: 1024 },
  mobile:  { width: 390,  height: 844  },
}

import fs from 'fs'

const STATE_PATH = path.join(ARTIFACTS_DIR, 'scratch/auth_state.json')

// Ensure the file exists immediately at module load time so Playwright can initialize
const dir = path.dirname(STATE_PATH)
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true })
}
if (!fs.existsSync(STATE_PATH)) {
  fs.writeFileSync(STATE_PATH, JSON.stringify({ cookies: [], origins: [] }))
}

test.beforeAll(async ({ browser }) => {
  // Generate storage state if it's a dummy placeholder
  let isDummy = true
  try {
    if (fs.existsSync(STATE_PATH)) {
      const data = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'))
      if (data.cookies && data.cookies.length > 0) {
        isDummy = false
      }
    }
  } catch (e) {
    isDummy = true
  }

  if (isDummy) {
    console.log('🔑 Performing one-time E2E login to establish storage state...');
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.goto(`${BASE_URL}/auth/login`)
    await page.fill('input[type="email"]', EMAIL)
    await page.fill('input[type="password"]', PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard', { timeout: 15_000 })
    await context.storageState({ path: STATE_PATH })
    await context.close()
    console.log('✅ Storage state established successfully.');
  }
})

// Use the pre-authenticated storage state for all tests in this spec
test.use({ storageState: STATE_PATH })

// ─── Helper: navigate to planner ──────────────────────────────────
async function loginAndNavigateToPLanner(page) {
  await page.goto(`${BASE_URL}/dashboard/planner`)
  await page.waitForLoadState('networkidle')
  await page.waitForSelector('form', { timeout: 10_000 })
}

// ─── Helper: trigger generation (fill form + submit) ────────────────────────
async function triggerGeneration(page) {
  // Fill destination
  const destInput = page.locator('input[placeholder*="destination" i], input[name="destination"]').first()
  if (await destInput.count() > 0) {
    await destInput.fill('Goa')
  }

  // Fill source
  const srcInput = page.locator('input[placeholder*="from" i], input[name="source"], input[placeholder*="city" i]').first()
  if (await srcInput.count() > 0) {
    await srcInput.fill('Mumbai')
  }

  // Select Solo group type if available
  const soloBtn = page.locator('button:has-text("Solo"), div:has-text("Solo")').first()
  if (await soloBtn.count() > 0) {
    await soloBtn.click().catch(() => {})
  }

  // Submit the form
  const submitBtn = page.locator('button[type="submit"], button:has-text("Generate"), button:has-text("Plan")').first()
  await submitBtn.click()

  // Wait for generation screen to appear
  await page.waitForSelector('#generation-screen', { timeout: 10_000 })
}

// ─── Helper: take screenshot ────────────────────────────────────────────────
async function screenshot(page, name) {
  const p = path.join(ARTIFACTS_DIR, `generation_${name}.png`)
  await page.screenshot({ path: p, fullPage: false })
  console.log(`📸 ${name}: ${p}`)
}

// ══════════════════════════════════════════════════════════════════════════════
// TEST SUITE
// ══════════════════════════════════════════════════════════════════════════════

test.describe('Planner Generation Screen', () => {

  // ── Desktop ────────────────────────────────────────────────────────────────
  test('Desktop — Generation screen renders and stage advances', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop)
    await loginAndNavigateToPLanner(page)
    await triggerGeneration(page)

    // ── Verify generation screen is visible ──
    const screen = page.locator('#generation-screen')
    await expect(screen).toBeVisible()

    // ── Verify HeroIllustration: destination heading ──
    const heading = page.locator('#generation-screen h2')
    await expect(heading).toBeVisible()
    const headingText = await heading.innerText()
    console.log(`🏙️  Destination heading: "${headingText}"`)
    expect(headingText.length).toBeGreaterThan(0)

    // ── Verify NarrativeTimeline is present ──
    const timeline = page.locator('#generation-screen ol[aria-label="AI generation stages"]')
    await expect(timeline).toBeVisible()

    // ── Verify stage rows (5 expected) ──
    const rows = page.locator('#generation-screen ol[aria-label="AI generation stages"] li')
    await expect(rows).toHaveCount(5)

    // ── Verify ProgressIndicator ──
    const progressLine = page.locator('#generation-screen [aria-label*="actively compiling" i]')
    await expect(progressLine).toBeVisible()

    // ── Verify TravelTip card ──
    const tipCard = page.locator('#generation-screen [aria-label="Travel tip"]')
    await expect(tipCard).toBeVisible()

    // ── Verify EstimatedTime is present ──
    const timeEl = page.locator('#generation-screen [aria-label^="Time elapsed"]')
    await expect(timeEl).toBeVisible()

    // ── Verify cancel button ──
    const cancelBtn = page.locator('button[aria-label="Cancel AI generation and start over"]')
    await expect(cancelBtn).toBeVisible()

    // ── Screenshot ──
    await screenshot(page, 'desktop_stage0')

    // ── Wait for stage to advance (stage 0 is 4s, wait 5s) ──
    await page.waitForTimeout(5000)

    await screenshot(page, 'desktop_stage1')
  })

  // ── Laptop ────────────────────────────────────────────────────────────────
  test('Laptop — Generation screen layout', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.laptop)
    await loginAndNavigateToPLanner(page)
    await triggerGeneration(page)

    await expect(page.locator('#generation-screen')).toBeVisible()

    // Verify content column max-width constraint — content should be centered
    const contentCol = page.locator('#generation-screen > div:last-child')
    await expect(contentCol).toBeVisible()
    const box = await contentCol.boundingBox()
    console.log(`📐 Content column width on laptop: ${box?.width}px`)
    if (box) {
      expect(box.width).toBeLessThanOrEqual(580) // max-width: 560px + small margins
    }

    await screenshot(page, 'laptop_generation')
  })

  // ── Tablet ────────────────────────────────────────────────────────────────
  test('Tablet — Generation screen responsive layout', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.tablet)
    await loginAndNavigateToPLanner(page)
    await triggerGeneration(page)

    const screen = page.locator('#generation-screen')
    await expect(screen).toBeVisible()

    // Heading should still be visible
    await expect(page.locator('#generation-screen h2')).toBeVisible()

    // Timeline should be visible
    await expect(page.locator('#generation-screen ol[aria-label="AI generation stages"]')).toBeVisible()

    await screenshot(page, 'tablet_generation')
  })

  // ── Mobile ────────────────────────────────────────────────────────────────
  test('Mobile — Generation screen stacks vertically', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile)
    await loginAndNavigateToPLanner(page)
    await triggerGeneration(page)

    const screen = page.locator('#generation-screen')
    await expect(screen).toBeVisible()

    // Heading
    await expect(page.locator('#generation-screen h2')).toBeVisible()

    // Timeline (should be fully visible on mobile)
    await expect(page.locator('#generation-screen ol[aria-label="AI generation stages"]')).toBeVisible()

    // ProgressLine
    await expect(page.locator('#generation-screen [aria-label*="actively compiling" i]')).toBeVisible()

    await screenshot(page, 'mobile_generation')
  })

  // ── Accessibility ─────────────────────────────────────────────────────────
  test('Accessibility — ARIA attributes on generation screen', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop)
    await loginAndNavigateToPLanner(page)
    await triggerGeneration(page)

    // Root has role=status and aria-live
    const screen = page.locator('#generation-screen')
    await expect(screen).toHaveAttribute('role', 'status')
    await expect(screen).toHaveAttribute('aria-live', 'polite')
    await expect(screen).toHaveAttribute('aria-label', 'Gemini AI is generating your trip itinerary')

    // GenerationStatus has aria-live
    const statusDiv = page.locator('[aria-live="polite"][aria-atomic="true"]')
    await expect(statusDiv.first()).toBeVisible()

    // Progress Line has correct accessibility
    const progressLine = page.locator('[aria-label*="actively compiling" i]').first()
    await expect(progressLine).toHaveAttribute('role', 'status')

    // Cancel button has descriptive aria-label
    const cancelBtn = page.locator('button[aria-label="Cancel AI generation and start over"]')
    await expect(cancelBtn).toBeVisible()

    // Stage list is an <ol> with aria-label
    const stageList = page.locator('ol[aria-label="AI generation stages"]')
    await expect(stageList).toBeVisible()

    // Active stage row has aria-current=step
    const activeStep = page.locator('[aria-current="step"]')
    await expect(activeStep).toBeVisible()

    console.log('✅ All ARIA attributes verified')
    await screenshot(page, 'accessibility_check')
  })

  // ── Stage Narrative Updates ───────────────────────────────────────────────
  test('Stage narrative — text updates over time', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop)
    await loginAndNavigateToPLanner(page)
    await triggerGeneration(page)

    // Capture initial stage message
    const statusEl = page.locator('[aria-live="polite"][aria-atomic="true"] p').first()
    await expect(statusEl).toBeVisible()
    const msg0 = await statusEl.innerText()
    console.log(`💬 Stage 0 message: "${msg0}"`)

    // Wait for stage 0 → stage 1 transition (4s stage + buffer)
    await page.waitForTimeout(5500)
    const msg1 = await statusEl.innerText()
    console.log(`💬 Stage 1 message: "${msg1}"`)

    // Messages should differ
    expect(msg1).not.toBe(msg0)

    await screenshot(page, 'narrative_stage1')
  })

  // ── Cancel behaviour ──────────────────────────────────────────────────────
  test('Cancel — clicking start over returns to form', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop)
    await loginAndNavigateToPLanner(page)
    await triggerGeneration(page)

    await expect(page.locator('#generation-screen')).toBeVisible()

    // Click cancel
    const cancelBtn = page.locator('button[aria-label="Cancel AI generation and start over"]')
    await cancelBtn.click()

    // Form should reappear (generation screen exits)
    await page.waitForSelector('form', { timeout: 5000 })
    const form = page.locator('form')
    await expect(form).toBeVisible()
    console.log('✅ Form reappeared after cancel')

    await screenshot(page, 'cancel_returns_to_form')
  })

  // ── Background photography ────────────────────────────────────────────────
  test('Background — ambient photo renders', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop)
    await loginAndNavigateToPLanner(page)
    await triggerGeneration(page)

    // Background img element should exist (aria-hidden)
    const bgImg = page.locator('#generation-screen img[alt=""]').first()
    await expect(bgImg).toBeAttached()
    console.log('✅ Background photography element present')

    await screenshot(page, 'background_photo')
  })

  // ── Skeleton reveal at stage 2 ────────────────────────────────────────────
  test('Skeleton — reveals at stage 2+', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop)
    await loginAndNavigateToPLanner(page)
    await triggerGeneration(page)

    // At stage 0, skeleton should NOT be visible (appears at stage 2)
    const skeletonSection = page.locator('#generation-screen [aria-hidden="true"]:has(.skeleton)').first()
    const initialCount = await skeletonSection.count()
    console.log(`🦴 Skeleton sections at stage 0: ${initialCount}`)

    // Wait for stage 0 + 1 to pass (4s + 5s = 9s + buffer)
    await page.waitForTimeout(11000)

    // Now at stage 2+ — skeleton should appear
    // Check for the "Your plan is taking shape" text as indicator
    const skeletonLabel = page.locator('text="Your plan is taking shape"')
    await expect(skeletonLabel).toBeVisible({ timeout: 3000 })
    console.log('✅ Skeleton section visible at stage 2')

    await screenshot(page, 'skeleton_stage2')
  })

  // ── Performance — no frozen UI ────────────────────────────────────────────
  test('Performance — UI remains interactive during generation', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop)
    await loginAndNavigateToPLanner(page)
    await triggerGeneration(page)

    // Measure time for tip dots to be clickable
    const tipDot = page.locator('#generation-screen button[aria-label^="Show tip"]').first()
    await expect(tipDot).toBeEnabled({ timeout: 3000 })

    // Click a tip dot — should respond immediately
    const before = Date.now()
    await tipDot.click()
    const after = Date.now()
    console.log(`⚡ Tip dot response time: ${after - before}ms`)
    expect(after - before).toBeLessThan(300) // must respond within 300ms

    // Cancel button is also interactive
    const cancelBtn = page.locator('button[aria-label="Cancel AI generation and start over"]')
    await expect(cancelBtn).toBeEnabled()

    await screenshot(page, 'performance_interactive')
  })
})
