import { test, expect } from '@playwright/test'

test.describe('Statuspage Plugin', () => {
  test.describe('Page Load', () => {
    test('should load the example site', async ({ page }) => {
      await page.goto('/')

      // Check page loads
      await expect(page.locator('h1')).toContainText('Statuspage')
    })

    test('should load docs page', async ({ page }) => {
      await page.goto('/docs/intro')

      // Check page title
      await expect(page.locator('h1')).toContainText('Introduction')

      // Check content renders
      await expect(
        page.getByText('docusaurus-plugin-statuspage', { exact: true }).first()
      ).toBeVisible()
    })
  })

  test.describe('Meta Tag Injection', () => {
    test('should inject statuspage meta tag', async ({ page }) => {
      await page.goto('/')

      // Check meta tag exists with correct attributes
      const metaTag = page.locator('meta[name="docusaurus-statuspage"]')
      await expect(metaTag).toHaveAttribute('data-statuspage-url', 'https://www.githubstatus.com')
      await expect(metaTag).toHaveAttribute('data-position', 'bottom-left')
      await expect(metaTag).toHaveAttribute('data-link-label', 'View status')
    })

    test('should inject meta tag on docs page', async ({ page }) => {
      await page.goto('/docs/intro')

      // Check meta tag exists on docs pages too
      const metaTag = page.locator('meta[name="docusaurus-statuspage"]')
      await expect(metaTag).toHaveAttribute('data-statuspage-url', 'https://www.githubstatus.com')
    })
  })
})

const SUMMARY_GLOB = '**/api/v2/summary.json'
const BANNER = '[data-statuspage-banner]'

function fulfilSummary(page, body) {
  return page.route(SUMMARY_GLOB, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify(body),
    })
  )
}

test.describe('Banner rendering', () => {
  test('renders a banner when the status page reports degraded service', async ({ page }) => {
    await fulfilSummary(page, {
      status: { indicator: 'minor', description: 'Partial System Outage' },
      incidents: [{ id: 'e2e-incident-1', shortlink: 'https://stspg.io/e2e1' }],
    })
    await page.goto('/')

    const banner = page.locator(BANNER)
    await expect(banner).toBeVisible()
    await expect(banner).toContainText('Partial System Outage')
    await expect(banner.getByRole('link', { name: 'View status' })).toHaveAttribute(
      'href',
      'https://stspg.io/e2e1'
    )
  })

  test('does not render a banner when all systems are operational', async ({ page }) => {
    await fulfilSummary(page, {
      status: { indicator: 'none', description: 'All Systems Operational' },
      incidents: [],
    })
    await page.goto('/')
    // Give the idle callback a chance to run before asserting absence
    await page.waitForTimeout(500)

    await expect(page.locator(BANNER)).toHaveCount(0)
  })

  test('dismissing the banner persists across reloads for the same incident', async ({ page }) => {
    await fulfilSummary(page, {
      status: { indicator: 'minor', description: 'Degraded' },
      incidents: [{ id: 'e2e-incident-2', shortlink: 'https://stspg.io/e2e2' }],
    })
    await page.goto('/')
    const banner = page.locator(BANNER)
    await expect(banner).toBeVisible()

    await banner.getByRole('button', { name: 'Dismiss status notice' }).click()
    await expect(banner).toHaveCount(0)

    await page.reload()
    await page.waitForTimeout(500)
    await expect(page.locator(BANNER)).toHaveCount(0)
  })

  test('survives client-side navigation without duplicating', async ({ page }) => {
    await fulfilSummary(page, {
      status: { indicator: 'minor', description: 'Degraded' },
      incidents: [],
    })
    await page.goto('/')
    await expect(page.locator(BANNER)).toHaveCount(1)

    await page
      .getByRole('link', { name: /docs|tutorial|get started/i })
      .first()
      .click()
    await page.waitForTimeout(500)
    await expect(page.locator(BANNER)).toHaveCount(1)
  })
})
