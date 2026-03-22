import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import type { ICustomWorld } from '../support/world'

// ── Given ────────────────────────────────────────────────────────────────────

Given('the URL field is empty', async function(this: ICustomWorld) {
  await this.page!.fill('[data-testid="server-url-input"]', '')
})

Given('the API key field is empty', async function(this: ICustomWorld) {
  await this.page!.fill('[data-testid="api-key-input"]', '')
})

Given('the app has reached the user selector screen', async function(this: ICustomWorld) {
  // Requires a Jellyfin server where /Users/Me fails (multi-user setup)
  // Set JELLYFIN_URL and JELLYFIN_API_KEY env vars
  const url = process.env.JELLYFIN_URL
  const apiKey = process.env.JELLYFIN_API_KEY
  if (!url || !apiKey) {
    this.testData!.skipped = true
    return
  }
  await this.page!.waitForSelector('[data-testid="auth-screen"]', { timeout: 15000 })
  await this.page!.fill('[data-testid="server-url-input"]', url)
  await this.page!.fill('[data-testid="api-key-input"]', apiKey)
  await this.page!.click('[data-testid="connect-button"]')
  await this.page!.waitForSelector('[data-testid="user-selector-screen"]', { timeout: 10000 })
})

// ── When ─────────────────────────────────────────────────────────────────────

When('I click the first user option', async function(this: ICustomWorld) {
  if (this.testData!.skipped) return
  await this.page!.click('[data-testid="user-option"]')
})

// ── Then ─────────────────────────────────────────────────────────────────────

Then('I should see the server URL input', async function(this: ICustomWorld) {
  await expect(this.page!.locator('[data-testid="server-url-input"]')).toBeVisible()
})

Then('I should see the API key input', async function(this: ICustomWorld) {
  await expect(this.page!.locator('[data-testid="api-key-input"]')).toBeVisible()
})

Then('I should see the connect button', async function(this: ICustomWorld) {
  await expect(this.page!.locator('[data-testid="connect-button"]')).toBeVisible()
})

Then('the connect button should be disabled', async function(this: ICustomWorld) {
  await expect(this.page!.locator('[data-testid="connect-button"]')).toBeDisabled()
})

Then('the connect button should still be enabled', async function(this: ICustomWorld) {
  await expect(this.page!.locator('[data-testid="connect-button"]')).toBeEnabled()
})

Then('I should see the user selector screen', async function(this: ICustomWorld) {
  if (this.testData!.skipped) return
  await expect(this.page!.locator('[data-testid="user-selector-screen"]')).toBeVisible()
})

Then('at least one user option should be listed', async function(this: ICustomWorld) {
  if (this.testData!.skipped) return
  const count = await this.page!.locator('[data-testid="user-option"]').count()
  expect(count).toBeGreaterThan(0)
})

Then('I can re-enter credentials and try again', async function(this: ICustomWorld) {
  await this.page!.fill('[data-testid="server-url-input"]', 'http://localhost:19999')
  await expect(this.page!.locator('[data-testid="connect-button"]')).toBeEnabled()
})
