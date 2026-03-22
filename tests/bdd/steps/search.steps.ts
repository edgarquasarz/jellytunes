import { When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import type { ICustomWorld } from '../support/world'

// ── When ─────────────────────────────────────────────────────────────────────

When('I type {string} in the search input', async function(this: ICustomWorld, text: string) {
  if (this.testData!.skipped) return
  const input = this.page!.locator('[data-testid="search-input"]')
  await input.fill(text)
})

When('I clear the search input', async function(this: ICustomWorld) {
  if (this.testData!.skipped) return
  await this.page!.locator('[data-testid="search-input"]').fill('')
})

// ── Then ─────────────────────────────────────────────────────────────────────

Then('the search input should be visible', async function(this: ICustomWorld) {
  if (this.testData!.skipped) return
  await expect(this.page!.locator('[data-testid="search-input"]')).toBeVisible()
})

Then('library items or an empty state should be shown', async function(this: ICustomWorld) {
  if (this.testData!.skipped) return
  // After typing 2+ chars, either results or empty state should be visible
  await this.page!.waitForTimeout(600) // wait for debounce
  const hasItems = await this.page!.locator('[data-testid="library-item"]').first().isVisible().catch(() => false)
  const hasEmpty = await this.page!.locator('[data-testid="library-empty"]').isVisible().catch(() => false)
  const hasLoading = await this.page!.locator('[data-testid="library-loading"]').isVisible().catch(() => false)
  expect(hasItems || hasEmpty || hasLoading).toBe(true)
})

Then('the library empty state should be visible', async function(this: ICustomWorld) {
  if (this.testData!.skipped) return
  await this.page!.waitForTimeout(600)
  await expect(this.page!.locator('[data-testid="library-empty"]')).toBeVisible({ timeout: 10000 })
})
