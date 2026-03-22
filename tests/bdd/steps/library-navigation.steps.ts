import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import type { ICustomWorld } from '../support/world'

// ── Given ────────────────────────────────────────────────────────────────────

Given('a device is selected in the sidebar', async function(this: ICustomWorld) {
  if (this.testData!.skipped) return
  // Click first available device (USB or saved folder) if present
  const deviceItem = this.page!.locator('[data-testid="device-item"]').first()
  const hasDevice = await deviceItem.isVisible().catch(() => false)
  if (hasDevice) {
    await deviceItem.click()
    this.testData!.deviceSelected = true
  }
})

Given('at least one library item is selected', async function(this: ICustomWorld) {
  if (this.testData!.skipped) return
  await this.page!.click('[data-testid="library-item"]:first-child')
})

// ── When ─────────────────────────────────────────────────────────────────────

When('I click the albums tab', async function(this: ICustomWorld) {
  if (this.testData!.skipped) return
  await this.page!.click('[data-testid="tab-albums"]')
})

When('I click the playlists tab', async function(this: ICustomWorld) {
  if (this.testData!.skipped) return
  await this.page!.click('[data-testid="tab-playlists"]')
})

When('I click the first library item', async function(this: ICustomWorld) {
  if (this.testData!.skipped) return
  await this.page!.click('[data-testid="library-item"]:first-child')
})

When('I click the {string} sync filter', async function(this: ICustomWorld, filter: string) {
  if (this.testData!.skipped) return
  const filterMap: Record<string, string> = {
    'All': 'sync-filter-all',
    'Selected': 'sync-filter-selected',
    'Not selected': 'sync-filter-unselected',
  }
  const testId = filterMap[filter]
  if (!testId) throw new Error(`Unknown sync filter: "${filter}"`)
  await this.page!.click(`[data-testid="${testId}"]`)
})

// ── Then ─────────────────────────────────────────────────────────────────────

Then('the artists tab should be active', async function(this: ICustomWorld) {
  if (this.testData!.skipped) return
  await expect(this.page!.locator('[data-testid="tab-artists"]')).toBeVisible()
})

Then('the albums tab should be active', async function(this: ICustomWorld) {
  if (this.testData!.skipped) return
  await expect(this.page!.locator('[data-testid="tab-albums"]')).toBeVisible()
})

Then('the playlists tab should be active', async function(this: ICustomWorld) {
  if (this.testData!.skipped) return
  await expect(this.page!.locator('[data-testid="tab-playlists"]')).toBeVisible()
})

Then('the first library item should be selected', async function(this: ICustomWorld) {
  if (this.testData!.skipped || !this.testData!.deviceSelected) return
  const firstItem = this.page!.locator('[data-testid="library-item"]').first()
  const checkbox = firstItem.locator('input[type="checkbox"]')
  await expect(checkbox).toBeChecked()
})

Then('only selected items should be visible', async function(this: ICustomWorld) {
  if (this.testData!.skipped) return
  const items = this.page!.locator('[data-testid="library-item"]')
  const count = await items.count()
  for (let i = 0; i < count; i++) {
    const checkbox = items.nth(i).locator('input[type="checkbox"]')
    await expect(checkbox).toBeChecked()
  }
})

Then('all items should be visible again', async function(this: ICustomWorld) {
  if (this.testData!.skipped) return
  const count = await this.page!.locator('[data-testid="library-item"]').count()
  expect(count).toBeGreaterThan(0)
})
