import { test, expect } from '@playwright/test'

test('app loads without crash', async ({ page }) => {
  await page.goto('/')
  await expect(page).not.toHaveTitle('Error')
})
