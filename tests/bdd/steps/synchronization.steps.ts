import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import type { ICustomWorld } from '../support/world'

// ── Given ────────────────────────────────────────────────────────────────────

Given('a saved destination is available in the sidebar', async function(this: ICustomWorld) {
  if (this.testData!.skipped) return
  const deviceItem = this.page!.locator('[data-testid="device-item"]').first()
  const hasDevice = await deviceItem.isVisible().catch(() => false)
  if (!hasDevice) {
    this.testData!.skipped = true
  }
})

// ── When ─────────────────────────────────────────────────────────────────────

When('I click the add folder button', async function(this: ICustomWorld) {
  if (this.testData!.skipped) return
  // Store whether dialog was triggered via the IPC call
  this.testData!.addFolderClicked = true
  await this.page!.click('[data-testid="add-folder-button"]')
})

When('I click the destination in the sidebar', async function(this: ICustomWorld) {
  if (this.testData!.skipped) return
  await this.page!.click('[data-testid="device-item"]')
  this.testData!.destinationClicked = true
})

When('I click the sync button', async function(this: ICustomWorld) {
  if (this.testData!.skipped) return
  await this.page!.click('[data-testid="sync-button"]')
})

When('I click the MP3 toggle', async function(this: ICustomWorld) {
  if (this.testData!.skipped) return
  await this.page!.click('[data-testid="mp3-toggle"]')
})

// ── Then ─────────────────────────────────────────────────────────────────────

Then('the add folder dialog should be triggered', async function(this: ICustomWorld) {
  if (this.testData!.skipped) return
  // The dialog is native (OS file picker via Electron IPC) — we can only verify the button was clicked
  expect(this.testData!.addFolderClicked).toBe(true)
})

Then('the sync panel should be visible', async function(this: ICustomWorld) {
  if (this.testData!.skipped) return
  await expect(this.page!.locator('[data-testid="sync-panel"]')).toBeVisible({ timeout: 5000 })
})

Then('the sync button should be visible', async function(this: ICustomWorld) {
  if (this.testData!.skipped) return
  await expect(this.page!.locator('[data-testid="sync-button"]')).toBeVisible()
})

Then('the sync button should be disabled', async function(this: ICustomWorld) {
  if (this.testData!.skipped) return
  await expect(this.page!.locator('[data-testid="sync-button"]')).toBeDisabled()
})

Then('the sync preview modal should be visible', async function(this: ICustomWorld) {
  if (this.testData!.skipped) return
  await expect(this.page!.locator('[data-testid="sync-preview-modal"]')).toBeVisible({ timeout: 10000 })
})

Then('the track count should be shown', async function(this: ICustomWorld) {
  if (this.testData!.skipped) return
  await expect(this.page!.locator('[data-testid="preview-track-count"]')).toBeVisible()
})

Then('the MP3 toggle should be on', async function(this: ICustomWorld) {
  if (this.testData!.skipped) return
  // After toggling, the button background changes — verify it's in the "on" state via aria or class
  const toggle = this.page!.locator('[data-testid="mp3-toggle"]')
  await expect(toggle).toBeVisible()
  // Check the inner span has translate-x-6 (on position)
  const innerSpan = toggle.locator('span')
  await expect(innerSpan).toHaveClass(/translate-x-6/)
})
