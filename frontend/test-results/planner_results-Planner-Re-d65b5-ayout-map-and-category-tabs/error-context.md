# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: planner_results.spec.js >> Planner Results Screen >> Desktop — Verify complete results layout, map, and category tabs
- Location: planner_results.spec.js:131:3

# Error details

```
Test timeout of 150000ms exceeded.
```

```
Error: locator.fill: Test timeout of 150000ms exceeded.
Call log:
  - waiting for locator('input[placeholder="Origin" i]').first()

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - img "Scenic Travel Background" [ref=e5]
  - generic [ref=e9]:
    - generic [ref=e10]:
      - link "TripSetGo Logo TripSetGo" [ref=e11] [cursor=pointer]:
        - /url: /
        - img "TripSetGo Logo" [ref=e12]
        - generic [ref=e13]: TripSetGo
      - heading "Welcome back" [level=1] [ref=e14]
      - paragraph [ref=e15]: Sign in to continue planning
    - generic [ref=e16]:
      - generic [ref=e17]:
        - generic [ref=e18]: Email*
        - generic [ref=e19]:
          - generic:
            - img
          - textbox "Email*" [ref=e20]:
            - /placeholder: you@email.com
      - generic [ref=e21]:
        - generic [ref=e22]: Password*
        - generic [ref=e23]:
          - generic:
            - img
          - textbox "Password*" [ref=e24]:
            - /placeholder: Your password
          - button "Show password" [ref=e26] [cursor=pointer]:
            - img [ref=e27]
      - link "Forgot password?" [ref=e31] [cursor=pointer]:
        - /url: /auth/forgot-password
      - button "Sign In" [ref=e32] [cursor=pointer]
    - generic [ref=e33]:
      - generic [ref=e36]: or continue with
      - generic [ref=e40]:
        - button "Sign in with Google. Opens in new tab" [ref=e42] [cursor=pointer]:
          - generic [ref=e44]:
            - img [ref=e47]
            - generic [ref=e54]: Sign in with Google
        - iframe
    - paragraph [ref=e55]:
      - text: Don't have an account?
      - link "Sign up free" [ref=e56] [cursor=pointer]:
        - /url: /auth/signup
```

# Test source

```ts
  1   | // planner_results.spec.js
  2   | // Playwright E2E tests for the AI Planner Results Page.
  3   | // Tests: Desktop, Laptop, Tablet, Mobile viewports.
  4   | // Verifies: itinerary timeline, choice cards, budget snapshot updates, weather essentials, map preview, A11y, responsiveness, and draft compare.
  5   | import { test, expect } from '@playwright/test'
  6   | import path from 'path'
  7   | import fs from 'fs'
  8   | 
  9   | const BASE_URL       = 'http://localhost:3000'
  10  | const ARTIFACTS_DIR  = 'C:/Users/ASUS/.gemini/antigravity-ide/brain/575cc923-d8c1-419f-94c9-ba38ef8e48ac'
  11  | const EMAIL          = 'testuser@tripsetgo.com'
  12  | const PASSWORD       = 'password123'
  13  | 
  14  | const VIEWPORTS = {
  15  |   desktop: { width: 1440, height: 900  },
  16  |   laptop:  { width: 1280, height: 800  },
  17  |   tablet:  { width: 768,  height: 1024 },
  18  |   mobile:  { width: 390,  height: 844  },
  19  | }
  20  | 
  21  | const STATE_PATH = path.join(ARTIFACTS_DIR, 'scratch/auth_state.json')
  22  | 
  23  | // Ensure the file exists immediately at module load time so Playwright can initialize
  24  | const dir = path.dirname(STATE_PATH)
  25  | if (!fs.existsSync(dir)) {
  26  |   fs.mkdirSync(dir, { recursive: true })
  27  | }
  28  | if (!fs.existsSync(STATE_PATH)) {
  29  |   fs.writeFileSync(STATE_PATH, JSON.stringify({ cookies: [], origins: [] }))
  30  | }
  31  | 
  32  | test.beforeAll(async ({ browser }) => {
  33  |   let isDummy = true
  34  |   try {
  35  |     if (fs.existsSync(STATE_PATH)) {
  36  |       const data = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'))
  37  |       if (data.cookies && data.cookies.length > 0) {
  38  |         isDummy = false
  39  |       }
  40  |     }
  41  |   } catch (e) {
  42  |     isDummy = true
  43  |   }
  44  | 
  45  |   if (isDummy) {
  46  |     console.log('🔑 Performing one-time E2E login to establish storage state for Results...')
  47  |     const context = await browser.newContext()
  48  |     const page = await context.newPage()
  49  |     await page.goto(`${BASE_URL}/auth/login`)
  50  |     await page.fill('input[type="email"]', EMAIL)
  51  |     await page.fill('input[type="password"]', PASSWORD)
  52  |     await page.click('button[type="submit"]')
  53  |     await page.waitForURL('**/dashboard', { timeout: 15_000 })
  54  |     await page.waitForLoadState('networkidle') // Wait for tokens & localStorage to sync
  55  |     await context.storageState({ path: STATE_PATH })
  56  |     await context.close()
  57  |     console.log('✅ Storage state established successfully.')
  58  |   }
  59  | })
  60  | 
  61  | test.use({ storageState: STATE_PATH })
  62  | 
  63  | async function navigateAndGenerate(page) {
  64  |   // Capture console logs inside page to troubleshoot E2E issues
  65  |   page.on('console', msg => console.log(`[BROWSER CONSOLE] [${msg.type()}] ${msg.text()}`))
  66  |   page.on('pageerror', err => console.error('[BROWSER EXCEPTION]', err))
  67  | 
  68  |   await page.goto(`${BASE_URL}/dashboard/planner`)
  69  |   await page.waitForLoadState('networkidle')
  70  | 
  71  |   if (page.url().includes('/auth/login')) {
  72  |     console.log('🔑 Redirected to login page, logging in manually...')
  73  |     await page.fill('input[type="email"]', EMAIL)
  74  |     await page.fill('input[type="password"]', PASSWORD)
  75  |     await page.click('button[type="submit"]')
  76  |     await page.waitForURL('**/dashboard', { timeout: 15_000 })
  77  |     await page.goto(`${BASE_URL}/dashboard/planner`)
  78  |     await page.waitForLoadState('networkidle')
  79  |   }
  80  | 
  81  |   await page.waitForSelector('form', { timeout: 15_000 })
  82  | 
  83  |   // Fill Origin (Source)
  84  |   const srcInput = page.locator('input[placeholder="Origin" i]').first()
> 85  |   await srcInput.fill('Mumbai')
      |                  ^ Error: locator.fill: Test timeout of 150000ms exceeded.
  86  |   // Wait a split second and click outside to dismiss autocomplete if it pops up
  87  |   await page.waitForTimeout(200)
  88  | 
  89  |   // Fill Destination
  90  |   const destInput = page.locator('input[placeholder="Destination" i]').first()
  91  |   await destInput.fill('Goa')
  92  |   await page.waitForTimeout(200)
  93  | 
  94  |   // Fill dates
  95  |   const dateInputs = page.locator('input[type="date"]')
  96  |   if (await dateInputs.count() >= 2) {
  97  |     await dateInputs.nth(0).fill('2026-07-10')
  98  |     await dateInputs.nth(1).fill('2026-07-15')
  99  |   }
  100 | 
  101 |   // Fill budget
  102 |   const budgetInput = page.locator('input[placeholder*="50,000" i], input[type="number"]').first()
  103 |   if (await budgetInput.count() > 0) {
  104 |     await budgetInput.fill('50000')
  105 |   }
  106 | 
  107 |   // Select Solo
  108 |   const soloBtn = page.locator('button:has-text("Solo"), div:has-text("Solo")').first()
  109 |   if (await soloBtn.count() > 0) {
  110 |     await soloBtn.click().catch(() => {})
  111 |   }
  112 | 
  113 |   // Submit
  114 |   const submitBtn = page.locator('button[type="submit"], button:has-text("Generate"), button:has-text("Plan")').first()
  115 |   await submitBtn.click()
  116 | 
  117 |   // Wait for results container to appear (this means generation finished)
  118 |   console.log('⏳ Waiting for AI plan generation to finish...')
  119 |   await page.waitForSelector('[role="tablist"][aria-label*="Itinerary" i]', { timeout: 120_000 })
  120 |   console.log('🎉 AI plan generation finished!')
  121 | }
  122 | 
  123 | async function screenshot(page, name) {
  124 |   const p = path.join(ARTIFACTS_DIR, `results_${name}.png`)
  125 |   await page.screenshot({ path: p, fullPage: false })
  126 |   console.log(`📸 Saved screenshot: ${p}`)
  127 | }
  128 | 
  129 | test.describe('Planner Results Screen', () => {
  130 | 
  131 |   test('Desktop — Verify complete results layout, map, and category tabs', async ({ page }) => {
  132 |     test.setTimeout(150_000) // Give AI generation ample time to run
  133 |     await page.setViewportSize(VIEWPORTS.desktop)
  134 |     await navigateAndGenerate(page)
  135 | 
  136 |     // 1. Verify Hero Header (Second h1 on page is destination)
  137 |     const heroHeading = page.locator('h1').nth(1)
  138 |     await expect(heroHeading).toBeVisible()
  139 |     console.log(`🏙️ Hero Heading: "${await heroHeading.innerText()}"`)
  140 | 
  141 |     // 2. Verify Budget Tracker
  142 |     const budgetTracker = page.locator('[role="progressbar"]')
  143 |     await expect(budgetTracker).toBeVisible()
  144 | 
  145 |     // 3. Verify Map Preview is present
  146 |     const mapPreview = page.locator('[role="application"][aria-label*="map" i]')
  147 |     await expect(mapPreview).toBeVisible()
  148 | 
  149 |     // 4. Verify tabs list and switch to Transport tab
  150 |     const transportTabTrigger = page.locator('#tab-trigger-transport')
  151 |     await expect(transportTabTrigger).toBeVisible()
  152 |     await transportTabTrigger.click()
  153 | 
  154 |     // Verify Transport panel is active and cards are displayed
  155 |     const transportPanel = page.locator('#tabpanel-transport')
  156 |     await expect(transportPanel).toBeVisible()
  157 |     const transportCards = transportPanel.locator('[role="button"]')
  158 |     await expect(transportCards.first()).toBeVisible()
  159 | 
  160 |     // Click first card to select
  161 |     await transportCards.first().click()
  162 | 
  163 |     // 5. Switch to Stays (Hotels) tab
  164 |     const hotelsTabTrigger = page.locator('#tab-trigger-hotels')
  165 |     await hotelsTabTrigger.click()
  166 |     const hotelsPanel = page.locator('#tabpanel-hotels')
  167 |     await expect(hotelsPanel).toBeVisible()
  168 |     const hotelCards = hotelsPanel.locator('[role="button"]')
  169 |     await expect(hotelCards.first()).toBeVisible()
  170 |     await hotelCards.first().click()
  171 | 
  172 |     // 6. Switch to Essentials tab and verify weather/packing lists
  173 |     const essentialsTabTrigger = page.locator('#tab-trigger-essentials')
  174 |     await essentialsTabTrigger.click()
  175 |     const essentialsPanel = page.locator('#tabpanel-essentials')
  176 |     await expect(essentialsPanel).toBeVisible()
  177 | 
  178 |     // 7. Verify AI travel insights collapsible panel
  179 |     const insightsTrigger = page.locator('button:has-text("AI Travel Insights")')
  180 |     await expect(insightsTrigger).toBeVisible()
  181 |     await insightsTrigger.click()
  182 |     const insightsDrawer = page.locator('#insights-content-drawer')
  183 |     await expect(insightsDrawer).toBeVisible()
  184 | 
  185 |     await screenshot(page, 'desktop_results_view')
```