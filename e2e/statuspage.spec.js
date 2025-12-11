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
      await expect(page.getByText('docusaurus-plugin-statuspage')).toBeVisible()
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
  })

  test.describe('Banner Behavior', () => {
    test('should show banner when status is degraded', async ({ page }) => {
      // Mock the statuspage API to return degraded status
      await page.route('**/api/v2/summary.json', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: {
              indicator: 'minor',
              description: 'Minor Service Outage',
            },
            incidents: [],
          }),
        })
      })

      await page.goto('/')

      // Wait for banner to appear
      const banner = page.locator('[data-statuspage-banner="true"]')
      await expect(banner).toBeVisible({ timeout: 5000 })

      // Check banner content
      await expect(banner.locator('text=Minor Service Outage')).toBeVisible()
      await expect(banner.locator('a')).toContainText('View status')
    })

    test('should show banner with incident link when incidents exist', async ({ page }) => {
      // Mock the statuspage API with active incident
      await page.route('**/api/v2/summary.json', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: {
              indicator: 'major',
              description: 'Major System Outage',
            },
            incidents: [
              {
                id: 'abc123',
                name: 'Database Issues',
                shortlink: 'https://stspg.io/abc123',
                status: 'investigating',
              },
            ],
          }),
        })
      })

      await page.goto('/')

      // Wait for banner to appear
      const banner = page.locator('[data-statuspage-banner="true"]')
      await expect(banner).toBeVisible({ timeout: 5000 })

      // Check link goes to incident
      const link = banner.locator('a')
      await expect(link).toHaveAttribute('href', 'https://stspg.io/abc123')
    })

    test('should not show banner when status is none', async ({ page }) => {
      // Mock the statuspage API to return healthy status
      await page.route('**/api/v2/summary.json', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: {
              indicator: 'none',
              description: 'All Systems Operational',
            },
            incidents: [],
          }),
        })
      })

      await page.goto('/')

      // Wait a bit for potential banner
      await page.waitForTimeout(1000)

      // Banner should not exist
      const banner = page.locator('[data-statuspage-banner="true"]')
      await expect(banner).not.toBeVisible()
    })

    test('should dismiss banner on close click', async ({ page }) => {
      // Mock degraded status
      await page.route('**/api/v2/summary.json', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: {
              indicator: 'minor',
              description: 'Minor Service Outage',
            },
            incidents: [],
          }),
        })
      })

      await page.goto('/')

      // Wait for banner
      const banner = page.locator('[data-statuspage-banner="true"]')
      await expect(banner).toBeVisible({ timeout: 5000 })

      // Click dismiss button
      const closeButton = banner.locator('button[aria-label="Dismiss status notice"]')
      await closeButton.click()

      // Banner should be removed
      await expect(banner).not.toBeVisible()
    })

    test('should persist dismissal in localStorage', async ({ page }) => {
      // Mock degraded status
      await page.route('**/api/v2/summary.json', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: {
              indicator: 'minor',
              description: 'Minor Service Outage',
            },
            incidents: [
              {
                id: 'test-incident-123',
                name: 'Test Issue',
                shortlink: 'https://stspg.io/test123',
                status: 'investigating',
              },
            ],
          }),
        })
      })

      await page.goto('/')

      // Wait for banner and dismiss
      const banner = page.locator('[data-statuspage-banner="true"]')
      await expect(banner).toBeVisible({ timeout: 5000 })

      const closeButton = banner.locator('button')
      await closeButton.click()

      // Reload page
      await page.reload()

      // Wait for potential banner render
      await page.waitForTimeout(1000)

      // Banner should not appear again for same incident
      await expect(banner).not.toBeVisible()
    })
  })

  test.describe('Accessibility', () => {
    test('should have accessible banner', async ({ page }) => {
      // Mock degraded status
      await page.route('**/api/v2/summary.json', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: {
              indicator: 'minor',
              description: 'Minor Service Outage',
            },
            incidents: [],
          }),
        })
      })

      await page.goto('/')

      // Wait for banner
      const banner = page.locator('[data-statuspage-banner="true"]')
      await expect(banner).toBeVisible({ timeout: 5000 })

      // Check ARIA attributes
      await expect(banner).toHaveAttribute('role', 'status')
      await expect(banner).toHaveAttribute('aria-live', 'polite')

      // Check dismiss button has accessible label
      const closeButton = banner.locator('button')
      await expect(closeButton).toHaveAttribute('aria-label', 'Dismiss status notice')

      // Check link opens in new tab with security attributes
      const link = banner.locator('a')
      await expect(link).toHaveAttribute('target', '_blank')
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })
})
