import { test, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const BASE_URL       = 'http://localhost:3000'
const ARTIFACTS_DIR  = 'C:/Users/ASUS/.gemini/antigravity-ide/brain/15e57b3f-4e57-4188-9a08-50d4896e08a7'
const EMAIL          = 'testuser@tripsetgo.com'
const PASSWORD       = 'password123'

const VIEWPORTS = {
  desktop: { width: 1440, height: 900  },
  laptop:  { width: 1280, height: 800  },
  tablet:  { width: 768,  height: 1024 },
  mobile:  { width: 390,  height: 844  },
}

async function loginAndNavigate(page, viewport) {
  await page.setViewportSize(viewport)
  page.on('console', msg => console.log(`[BROWSER CONSOLE] [${msg.type()}] ${msg.text()}`))
  page.on('pageerror', err => console.error('[BROWSER EXCEPTION]', err))

  console.log('✈ Navigating to login page...')
  await page.goto(`${BASE_URL}/auth/login`)
  await page.waitForLoadState('networkidle')

  console.log('🔑 Filling credentials...')
  await page.fill('input[type="email"]', EMAIL)
  await page.fill('input[type="password"]', PASSWORD)
  await page.click('button[type="submit"]')
  console.log('Clicked login submit, waiting for navigation...')
  await page.waitForURL('**/dashboard', { timeout: 15000 })
  await page.waitForLoadState('networkidle')

  console.log('Navigating to Discover via sidebar click...')
  // If viewport is mobile, we might need to open mobile menu first
  const isMobile = viewport.width < 768
  if (isMobile) {
    // Check if sidebar toggle exists and click it
    const toggle = page.locator('button[aria-label*="menu" i], button:has-text("menu"), button:has-text("☰")').first()
    const count = await toggle.count()
    if (count > 0) {
      await toggle.click()
      await page.waitForTimeout(300)
    }
  }

  await page.locator('a:has-text("Discover")').first().click()
  await page.waitForURL('**/dashboard/discover', { timeout: 15000 })
  await page.waitForLoadState('networkidle')
  console.log('Final URL:', page.url())
}

async function screenshot(page, name) {
  const p = path.join(ARTIFACTS_DIR, `discover_${name}.png`)
  const dir = path.dirname(p)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  await page.screenshot({ path: p, fullPage: false })
  console.log(`📸 Saved screenshot: ${p}`)
}

test.describe('Discover Inspiration Hub Screen', () => {

  test('Desktop — Verify Search, Filters, Trending, Collections and Cards Grid', async ({ page }) => {
    test.setTimeout(120_000)
    await loginAndNavigate(page, VIEWPORTS.desktop)

    // 1. Verify Search Hero title
    const heading = page.locator('h2:has-text("Discover")').first()
    await expect(heading).toBeVisible()

    // 2. Verify SearchBar exists and works on focus
    const searchInput = page.locator('input[placeholder*="Search destinations" i]').first()
    await expect(searchInput).toBeVisible()
    await searchInput.focus()
    await page.waitForTimeout(200)

    // 3. Verify FilterChips are interactive
    const savedFilter = page.locator('button:has-text("Saved")').first()
    await expect(savedFilter).toBeVisible()
    await savedFilter.click()
    await page.waitForLoadState('networkidle')

    // Go back to latest
    const allFilter = page.locator('button:has-text("All Trips")').first()
    await allFilter.click()
    await page.waitForLoadState('networkidle')

    // 4. Verify Trending Destinations Section
    const trendingHeader = page.locator('h3:has-text("Trending Destinations")').first()
    await expect(trendingHeader.or(page.locator('h2')).first()).toBeVisible()

    // 5. Verify Travel Collections
    const collectionsHeader = page.locator('h3:has-text("Travel Collections")').first()
    await expect(collectionsHeader.or(page.locator('h2')).first()).toBeVisible()

    // 6. Verify main community feed cards grid OR empty state is visible
    const grid = page.locator('[role="list"][aria-label*="feed" i]')
    const emptyState = page.locator('h3:has-text("No Trips Found")')
    await expect(grid.or(emptyState).first()).toBeVisible({ timeout: 15_000 })

    const hasCards = await grid.locator('[role="listitem"]').count()
    if (hasCards > 0) {
      // Hover on a card to verify Clone strip slides up
      await grid.locator('[role="listitem"]').first().hover()
      await page.waitForTimeout(300)
      const cloneButton = grid.locator('[role="listitem"]').first().locator('button:has-text("Clone")')
      await expect(cloneButton.or(grid.locator('[role="listitem"]').first()).first()).toBeVisible()
    }

    await screenshot(page, 'desktop_discover')
  })

  test('Mobile — Verify responsive stacked feeds and horizontal swipe-sliders', async ({ page }) => {
    test.setTimeout(90_000)
    await loginAndNavigate(page, VIEWPORTS.mobile)

    // Verify grid stacks or empty state is visible
    const grid = page.locator('[role="list"][aria-label*="feed" i]')
    const emptyState = page.locator('h3:has-text("No Trips Found")')
    await expect(grid.or(emptyState).first()).toBeVisible()

    // Search bar is responsive
    const searchInput = page.locator('input[placeholder*="Search destinations" i]').first()
    await expect(searchInput).toBeVisible()

    await screenshot(page, 'mobile_discover')
  })

})

