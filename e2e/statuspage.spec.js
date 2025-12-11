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
      await expect(metaTag).toHaveAttribute(
        'data-statuspage-url',
        'https://www.githubstatus.com'
      )
      await expect(metaTag).toHaveAttribute('data-position', 'bottom-left')
      await expect(metaTag).toHaveAttribute('data-link-label', 'View status')
    })

    test('should inject meta tag on docs page', async ({ page }) => {
      await page.goto('/docs/intro')

      // Check meta tag exists on docs pages too
      const metaTag = page.locator('meta[name="docusaurus-statuspage"]')
      await expect(metaTag).toHaveAttribute(
        'data-statuspage-url',
        'https://www.githubstatus.com'
      )
    })
  })
})
