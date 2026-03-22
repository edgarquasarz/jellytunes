import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import type { ICustomWorld } from '../support/world'

// ── App startup ──────────────────────────────────────────────────────────────

Given('the app is open on the login screen', async function(this: ICustomWorld) {
  await this.page!.waitForSelector('[data-testid="auth-screen"]', { timeout: 15000 })
})

Given('the user is authenticated and the library is loaded', async function(this: ICustomWorld) {
  // Requires JELLYFIN_URL and JELLYFIN_API_KEY env vars to be set
  const url = process.env.JELLYFIN_URL
  const apiKey = process.env.JELLYFIN_API_KEY

  if (!url || !apiKey) {
    // Skip gracefully if no credentials provided
    this.testData!.skipped = true
    return
  }

  await this.page!.waitForSelector('[data-testid="auth-screen"]', { timeout: 15000 })
  await this.page!.fill('[data-testid="server-url-input"]', url)
  await this.page!.fill('[data-testid="api-key-input"]', apiKey)
  await this.page!.click('[data-testid="connect-button"]')

  // Handle user selector if shown
  try {
    await this.page!.waitForSelector('[data-testid="user-selector-screen"]', { timeout: 5000 })
    await this.page!.click('[data-testid="user-option"]:first-child')
  } catch {
    // No user selector — direct login
  }

  await this.page!.waitForSelector('[data-testid="library-content"]', { timeout: 15000 })
})

// ── Common actions ────────────────────────────────────────────────────────────

When('I click the connect button', async function(this: ICustomWorld) {
  await this.page!.click('[data-testid="connect-button"]')
})

When('I enter the server URL {string}', async function(this: ICustomWorld, url: string) {
  await this.page!.fill('[data-testid="server-url-input"]', url)
})

When('I enter the API key {string}', async function(this: ICustomWorld, apiKey: string) {
  await this.page!.fill('[data-testid="api-key-input"]', apiKey)
})

// ── Common assertions ─────────────────────────────────────────────────────────

Then('an error message should be visible', async function(this: ICustomWorld) {
  await expect(this.page!.locator('[data-testid="error-message"]')).toBeVisible({ timeout: 10000 })
})

Then('the error message element should exist', async function(this: ICustomWorld) {
  await this.page!.waitForSelector('[data-testid="error-message"]', { timeout: 10000 })
})

Then('the library content should be visible', async function(this: ICustomWorld) {
  await expect(this.page!.locator('[data-testid="library-content"]')).toBeVisible({ timeout: 10000 })
})

Then('library items should be visible', async function(this: ICustomWorld) {
  if (this.testData!.skipped) return
  await expect(this.page!.locator('[data-testid="library-item"]').first()).toBeVisible({ timeout: 10000 })
})
